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
    
    // Processar o Excel
    const workbook = XLSX.read(data, { type: 'array' })
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })

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
    // 0=Nº, 1=Cidade, 2=Nº Vara, 3=Reclamante, 4=Nº do Processo, 5=Função, 6=Reclamada
    // 27=Data de nomeação, 33=Prazo entrega, 34=Data entrega, 49=Honorários, 50=Sentença
    
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
        const numeroProcesso = row[4] ? String(row[4]).trim() : null
        const requerente = row[3] ? String(row[3]).trim() : null
        const requerido = row[6] ? String(row[6]).trim() : null
        const vara = row[2] ? String(row[2]).trim() : null
        const dataNomeacao = parseDate(row[27])  // Coluna 27
        const dataPrazo = parseDate(row[33])     // Coluna 33
        const dataEntrega = parseDate(row[34])    // Coluna 34
        const honorarios = parseHonorarios(row[49]) // Coluna 49
        const observacoes = row[50] ? String(row[50]).trim() : null // Coluna 50

        // Validar apenas os campos realmente obrigatórios no banco
        if (!numeroProcesso || !requerente || !requerido || !vara) {
          console.log(`Linha ${i + 1}: Dados obrigatórios faltando - Processo: ${numeroProcesso}, Req: ${requerente}, Reqdo: ${requerido}, Vara: ${vara}`)
          continue
        }
        
        // Se não tiver data de nomeação, usar a data atual
        const finalDataNomeacao = dataNomeacao || new Date().toISOString().split('T')[0]

        const status = determineStatus(dataEntrega, observacoes)

        const { error } = await supabaseClient
          .from('pericias')
          .insert({
            numero_processo: numeroProcesso,
            requerente: requerente,
            requerido: requerido,
            vara: vara,
            perito: 'Engº Arthur Reis',
            status: status,
            data_nomeacao: finalDataNomeacao,
            data_prazo: dataPrazo,
            data_entrega: dataEntrega,
            honorarios: honorarios,
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