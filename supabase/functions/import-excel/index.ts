import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as XLSX from 'https://deno.land/x/sheetjs@v0.18.3/xlsx.mjs'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Starting Excel import...')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    
    if (!user) {
      throw new Error('Não autenticado')
    }

    console.log('User authenticated:', user.id)

    // Receber o arquivo
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      throw new Error('Nenhum arquivo enviado')
    }

    console.log('File received:', file.name, 'Size:', file.size)

    // Ler o arquivo
    const arrayBuffer = await file.arrayBuffer()
    const data = new Uint8Array(arrayBuffer)
    
    // Processar o Excel com suporte a hiperlinks
    const workbook = XLSX.read(data, { type: 'array', cellStyles: true })
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: null })

    console.log('Excel parsed, rows:', jsonData.length)

    // Função para converter data do Excel para formato ISO
    const parseDate = (value: any): string | null => {
      if (!value) return null
      
      // Se for string no formato DD/MM/YY ou DD/MM/YYYY
      if (typeof value === 'string') {
        const parts = value.trim().split('/')
        if (parts.length === 3) {
          const day = parts[0].padStart(2, '0')
          const month = parts[1].padStart(2, '0')
          let year = parts[2]
          
          if (year.length === 2) {
            const yearNum = parseInt(year)
            year = yearNum > 50 ? `19${year}` : `20${year}`
          }
          
          return `${year}-${month}-${day}`
        }
      }
      
      // Se for número (data do Excel)
      if (typeof value === 'number') {
        const excelEpoch = new Date(1899, 11, 30)
        const date = new Date(excelEpoch.getTime() + value * 86400000)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }
      
      return null
    }

    const parseTime = (value: any): string | null => {
      if (!value) return null
      
      // Se já for uma string de horário (HH:MM)
      if (typeof value === 'string') {
        // Se tiver múltiplos horários separados por /, pegar apenas o primeiro
        if (value.includes('/')) {
          value = value.split('/')[0].trim()
        }
        
        if (value.includes(':')) {
          return value
        }
      }
      
      // Se for número serial do Excel (fração de dia)
      if (typeof value === 'number') {
        // Excel armazena tempo como fração de 1 dia
        // Ex: 0.5 = 12:00, 0.25 = 06:00
        const totalMinutes = Math.round(value * 24 * 60)
        const hours = Math.floor(totalMinutes / 60)
        const minutes = totalMinutes % 60
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
      }
      
      return null
    }

    const parseHonorarios = (value: any): number | null => {
      if (!value) return null
      
      if (typeof value === 'number') return value
      
      if (typeof value === 'string') {
        const cleaned = value.replace(/R\$\s*/g, '')
                             .replace(/\./g, '')
                             .replace(/,/g, '.')
                             .trim()
        const num = parseFloat(cleaned)
        return isNaN(num) ? null : num
      }
      
      return null
    }

    const parseNRArray = (startCol: number, endCol: number, row: any[]): number[] | null => {
      const numbers: number[] = []
      
      for (let col = startCol; col <= endCol; col++) {
        const value = row[col]
        if (value) {
          // Se for número, adiciona o índice (col - startCol + 1)
          if (typeof value === 'number' || value === 1 || value === '1') {
            numbers.push(col - startCol + 1)
          }
        }
      }
      
      return numbers.length > 0 ? numbers : null
    }

    const extractHyperlink = (sheet: any, row: number, col: number): string | null => {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
      const cell = sheet[cellAddress]
      
      if (!cell) return null
      
      // Tentar extrair hiperlink da célula
      if (cell.l && cell.l.Target) {
        return cell.l.Target
      }
      
      return null
    }

    const determineStatus = (dataEntrega: string | null, observacoes: string | null): string => {
      if (observacoes && observacoes.toLowerCase().includes('acordo')) {
        if (dataEntrega) {
          return 'ACORDO APÓS REALIZAÇÃO DA PERÍCIA'
        }
        return 'FINALIZADO EM ACORDO ANTES DA PERÍCIA'
      }
      
      if (dataEntrega) {
        return 'LAUDO/ESCLARECIMENTOS ENTREGUES'
      }
      
      return 'AGUARDANDO LAUDO'
    }

    // Processar linhas (linha 0 é cabeçalho baseado na estrutura do Excel)
    const results = []
    const errors = []

    // Mapeamento correto das colunas do Excel:
    // 0=Nº, 1=Status, 2=Cidade, 3=Nº Vara, 4=Reclamante, 5=Nº do Processo (com hiperlink), 6=Função, 7=Reclamada, 8=Valor da causa
    // 9-22=NR15 (14 colunas), 23-27=NR16 (5 colunas)
    // 28=Data nomeação, 29=Data perícia agendada, 30=Horário, 31=Endereço, 32=E-mail Reclamante, 33=E-mail Reclamada
    // 34=Prazo entrega, 35=Data entrega, 36=Prazo esclarecimento, 37=Data esclarecimento
    // 48=Data recebimento, 49=Valor Recebimento, 50=Honorários, 51=Sentença, 52=Observação
    
    // Encontrar a linha do cabeçalho (procura por "Nº do Processo")
    let headerRow = 0
    for (let i = 0; i < Math.min(20, jsonData.length); i++) {
      const row = jsonData[i] as any[]
      if (row && row.some((cell: any) => String(cell).includes('Nº do Processo'))) {
        headerRow = i
        console.log(`Header found at row ${i}`)
        break
      }
    }

    for (let i = headerRow + 1; i < jsonData.length; i++) {
      const row = jsonData[i] as any[]
      
      // Pular linhas vazias ou linhas sem número de processo
      if (!row || row.length === 0) {
        console.log(`Linha ${i + 1}: Linha vazia`)
        continue
      }

      try {
        // Extrair dados das colunas corretas
        const numeroSequencial = row[0] ? String(row[0]).trim() : null
        const status = row[1] ? String(row[1]).trim().replace(/\s+/g, ' ') : 'AGUARDANDO LAUDO' // Normalizar espaços
        const cidade = row[2] ? String(row[2]).trim() : null
        const vara = row[3] ? String(row[3]).trim() : null
        const requerente = row[4] ? String(row[4]).trim() : null
        const numeroProcesso = row[5] ? String(row[5]).trim() : null
        const linkProcesso = extractHyperlink(firstSheet, i, 5) // Extrair hiperlink da coluna 5
        const funcao = row[6] ? String(row[6]).trim() : null
        const requerido = row[7] ? String(row[7]).trim() : null
        const valorCausa = parseHonorarios(row[8])
        const nr15 = parseNRArray(9, 22, row) // Colunas 9-22 para NR15 (índices 1-14)
        const nr16 = parseNRArray(23, 27, row) // Colunas 23-27 para NR16 (índices 1-5)
        const dataNomeacao = parseDate(row[28])
        const dataPericiaAgendada = parseDate(row[29])
        const horario = parseTime(row[30])
        const endereco = row[31] ? String(row[31]).trim() : null
        const emailReclamante = row[32] ? String(row[32]).trim() : null
        const emailReclamada = row[33] ? String(row[33]).trim() : null
        const dataPrazo = parseDate(row[34])
        const dataEntrega = parseDate(row[35])
        const prazoEsclarecimento = parseDate(row[36])
        const dataEsclarecimento = parseDate(row[37])
        const dataRecebimento = parseDate(row[48])
        const valorRecebimento = parseHonorarios(row[49])
        const honorarios = parseHonorarios(row[50])
        const sentenca = row[51] ? String(row[51]).trim() : null
        const observacoes = row[52] ? String(row[52]).trim() : null

        // Validar apenas os campos realmente obrigatórios no banco
        if (!numeroProcesso || !requerente || !requerido || !vara) {
          console.log(`Linha ${i + 1}: Dados obrigatórios faltando - Processo: ${numeroProcesso}, Req: ${requerente}, Reqdo: ${requerido}, Vara: ${vara}`)
          continue
        }
        
        // Se não tiver data de nomeação, usar a data atual
        const finalDataNomeacao = dataNomeacao || new Date().toISOString().split('T')[0]

        const { error } = await supabaseClient
          .from('pericias')
          .insert({
            numero_processo: numeroProcesso,
            link_processo: linkProcesso,
            cidade: cidade,
            requerente: requerente,
            funcao: funcao,
            requerido: requerido,
            vara: vara,
            valor_causa: valorCausa,
            nr15: nr15,
            nr16: nr16,
            perito: 'Engº Arthur Reis',
            status: status,
            data_nomeacao: finalDataNomeacao,
            data_pericia_agendada: dataPericiaAgendada,
            horario: horario,
            endereco: endereco,
            email_reclamante: emailReclamante,
            email_reclamada: emailReclamada,
            data_prazo: dataPrazo,
            data_entrega: dataEntrega,
            prazo_esclarecimento: prazoEsclarecimento,
            data_esclarecimento: dataEsclarecimento,
            data_recebimento: dataRecebimento,
            valor_recebimento: valorRecebimento,
            honorarios: honorarios,
            sentenca: sentenca,
            observacoes: observacoes,
            user_id: user.id,
          })

        if (error) {
          console.error(`Erro linha ${i + 1}:`, error.message)
          errors.push({ row: i + 1, error: error.message })
        } else {
          results.push({ row: i + 1, success: true })
          console.log(`Linha ${i + 1}: Importada com sucesso`)
        }
      } catch (error) {
        console.error(`Erro ao processar linha ${i + 1}:`, error)
        errors.push({ row: i + 1, error: (error as Error).message })
      }
    }

    console.log('Import complete. Success:', results.length, 'Errors:', errors.length)

    return new Response(
      JSON.stringify({ 
        message: 'Importação concluída',
        total: jsonData.length - 1,
        successful: results.length,
        failed: errors.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Import error:', error)
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})