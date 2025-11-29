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
    console.log('Starting Excel update...')
    
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

    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      throw new Error('Nenhum arquivo enviado')
    }

    console.log('File received:', file.name, 'Size:', file.size)

    const arrayBuffer = await file.arrayBuffer()
    const data = new Uint8Array(arrayBuffer)
    
    const workbook = XLSX.read(data, { type: 'array' })
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: null })

    console.log('Excel parsed, rows:', jsonData.length)

    // Helper functions
    const parseDate = (value: any): string | null => {
      if (!value) return null
      
      if (typeof value === 'string') {
        const trimmed = value.trim()
        if (!trimmed) return null
        
        const parts = trimmed.split('/')
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
      
      if (typeof value === 'string') {
        const trimmed = value.trim()
        if (!trimmed) return null
        
        if (trimmed.includes(':')) {
          const parts = trimmed.split(':')
          if (parts.length === 2) {
            return `${trimmed}:00`
          }
          return trimmed
        }
      }
      
      if (typeof value === 'number') {
        const totalMinutes = Math.round(value * 24 * 60)
        const hours = Math.floor(totalMinutes / 60)
        const minutes = totalMinutes % 60
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
      }
      
      return null
    }

    const parseNumber = (value: any): number | null => {
      if (!value) return null
      
      if (typeof value === 'number') return value
      
      if (typeof value === 'string') {
        const cleaned = value.replace(/R\$\s*/g, '')
                             .replace(/\./g, '')
                             .replace(/,/g, '.')
                             .trim()
        if (!cleaned) return null
        const num = parseFloat(cleaned)
        return isNaN(num) ? null : num
      }
      
      return null
    }

    const cleanString = (value: any): string | null => {
      if (!value) return null
      const str = String(value).trim()
      return str || null
    }

    // Column mapping from template
    const columnMap: Record<string, string> = {
      'Nº Processo*': 'numero_processo',
      'Nº': 'numero',
      'Status': 'status',
      'Nº Vara': 'vara',
      'Reclamante': 'requerente',
      'Reclamada': 'requerido',
      'Data Nomeação': 'data_nomeacao',
      'Prazo Entrega': 'data_prazo',
      'Data Perícia': 'data_pericia_agendada',
      'Horário': 'horario',
      'Data Entrega': 'data_entrega',
      'Prazo Esclarec.': 'prazo_esclarecimento',
      'Data Esclarec.': 'data_esclarecimento',
      'Data Recebimento': 'data_recebimento',
      'Cidade': 'cidade',
      'Endereço': 'endereco',
      'Função': 'funcao',
      'Perito': 'perito',
      'Valor da Causa': 'valor_causa',
      'Honorários': 'honorarios',
      'Valor Recebido': 'valor_recebimento',
      'Deslocamento': 'deslocamento',
      'Estação': 'estacao',
      'Nº Linha': 'linha_numero',
      'Cor Linha': 'linha_cor',
      'Link Processo': 'link_processo',
      'E-mail Reclamante': 'email_reclamante',
      'E-mail Reclamada': 'email_reclamada',
      'Observações': 'observacoes',
    }

    const dateFields = ['data_nomeacao', 'data_prazo', 'data_pericia_agendada', 'data_entrega', 'prazo_esclarecimento', 'data_esclarecimento', 'data_recebimento']
    const numberFields = ['numero', 'valor_causa', 'honorarios', 'valor_recebimento']
    const timeFields = ['horario']

    const results = { successful: 0, notFound: 0, failed: 0, errors: [] as any[] }

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i] as Record<string, any>
      
      // Get numero_processo - required field
      const numeroProcesso = cleanString(row['Nº Processo*'])
      
      if (!numeroProcesso) {
        console.log(`Row ${i + 2}: Missing numero_processo, skipping`)
        continue
      }

      console.log(`Processing row ${i + 2}: ${numeroProcesso}`)

      // Build update object only with non-empty fields
      const updateData: Record<string, any> = {}
      
      for (const [excelCol, dbCol] of Object.entries(columnMap)) {
        if (dbCol === 'numero_processo') continue // Skip the key field
        
        const value = row[excelCol]
        if (value === null || value === undefined || value === '') continue
        
        if (dateFields.includes(dbCol)) {
          const parsed = parseDate(value)
          if (parsed) updateData[dbCol] = parsed
        } else if (numberFields.includes(dbCol)) {
          const parsed = parseNumber(value)
          if (parsed !== null) updateData[dbCol] = parsed
        } else if (timeFields.includes(dbCol)) {
          const parsed = parseTime(value)
          if (parsed) updateData[dbCol] = parsed
        } else {
          const cleaned = cleanString(value)
          if (cleaned) updateData[dbCol] = cleaned
        }
      }

      if (Object.keys(updateData).length === 0) {
        console.log(`Row ${i + 2}: No fields to update`)
        continue
      }

      console.log(`Row ${i + 2}: Updating fields:`, Object.keys(updateData))

      try {
        // First check if the pericia exists for this user
        const { data: existing, error: selectError } = await supabaseClient
          .from('pericias')
          .select('id')
          .eq('numero_processo', numeroProcesso)
          .eq('user_id', user.id)
          .maybeSingle()

        if (selectError) {
          console.error(`Row ${i + 2}: Select error:`, selectError)
          results.errors.push({ row: i + 2, error: selectError.message })
          results.failed++
          continue
        }

        if (!existing) {
          console.log(`Row ${i + 2}: Pericia not found for processo ${numeroProcesso}`)
          results.notFound++
          continue
        }

        // Update the pericia
        const { error: updateError } = await supabaseClient
          .from('pericias')
          .update(updateData)
          .eq('id', existing.id)
          .eq('user_id', user.id)

        if (updateError) {
          console.error(`Row ${i + 2}: Update error:`, updateError)
          results.errors.push({ row: i + 2, error: updateError.message })
          results.failed++
        } else {
          console.log(`Row ${i + 2}: Updated successfully`)
          results.successful++
        }
      } catch (error) {
        console.error(`Row ${i + 2}: Error:`, error)
        results.errors.push({ row: i + 2, error: (error as Error).message })
        results.failed++
      }
    }

    console.log('Update complete:', results)

    return new Response(
      JSON.stringify({ 
        message: 'Atualização concluída',
        total: jsonData.length,
        successful: results.successful,
        notFound: results.notFound,
        failed: results.failed,
        errors: results.errors.length > 0 ? results.errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Update error:', error)
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
