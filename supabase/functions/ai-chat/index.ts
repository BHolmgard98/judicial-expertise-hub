import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [] } = await req.json();
    console.log('Received message:', message);

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Create Supabase client with service role for querying
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // System prompt with database schema
    const systemPrompt = `Você é um assistente de IA especializado em consultar o banco de dados de perícias judiciais.

INSTRUÇÕES IMPORTANTES:
- SEMPRE consulte o banco de dados antes de responder qualquer pergunta sobre perícias
- Use a ferramenta query_pericias para buscar informações no banco de dados
- Nunca invente ou assuma dados - consulte sempre o banco primeiro
- Responda em português brasileiro de forma clara e objetiva
- Formate os resultados de maneira legível
- Se não encontrar resultados, informe claramente
- Para consultas sobre NRs, lembre que são arrays e devem ser consultados adequadamente
- IMPORTANTE: Valores null significam campos vazios/não preenchidos
- Ao buscar valores máximos, mínimos ou calcular médias, SEMPRE ignore registros com null
- Use ordenação e filtragem para encontrar apenas registros com valores preenchidos
- Ao responder sobre valores numéricos (honorários, valor_causa, etc), considere apenas os não-null

SCHEMA DO BANCO DE DADOS:
Tabela: pericias
Campos principais:
  * numero (integer): número da perícia
  * numero_processo (text): número do processo judicial
  * status (text): status atual da perícia
  * vara (text): vara judicial
  * requerente (text): parte requerente
  * requerido (text): parte requerida
  * perito (text): nome do perito
  * nr15 (array): anexos da NR15 (exemplo: [1, 2, 3])
  * nr16 (array): anexos da NR16 (exemplo: [1, 2])
  * data_nomeacao (date): data de nomeação
  * data_prazo (date): prazo de entrega
  * data_pericia_agendada (date): data da perícia
  * honorarios (numeric): valor dos honorários
  * valor_recebimento (numeric): valor recebido
  * valor_causa (numeric): valor da causa
  * cidade (text): cidade
  * funcao (text): função do trabalhador
  * observacoes (text): observações
  * data_entrega (date): data de entrega do laudo
  * data_recebimento (date): data de recebimento dos honorários`;

    const tools = [
      {
        type: "function",
        function: {
          name: "query_pericias",
          description: "Consulta perícias no banco de dados com filtros e ordenação",
          parameters: {
            type: "object",
            properties: {
              filters: {
                type: "object",
                description: "Filtros para a consulta",
                properties: {
                  numero: { type: "integer", description: "Número da perícia" },
                  numero_processo: { type: "string", description: "Número do processo" },
                  status: { type: "string", description: "Status da perícia" },
                  vara: { type: "string", description: "Vara judicial" },
                  nr15_contains: { type: "array", items: { type: "integer" }, description: "Anexos NR15 que devem estar presentes" },
                  nr16_contains: { type: "array", items: { type: "integer" }, description: "Anexos NR16 que devem estar presentes" },
                  perito: { type: "string", description: "Nome do perito" },
                  cidade: { type: "string", description: "Cidade" },
                  requerente: { type: "string", description: "Parte requerente" },
                  requerido: { type: "string", description: "Parte requerida" },
                }
              },
              order_by: {
                type: "object",
                description: "Ordenação dos resultados",
                properties: {
                  column: { 
                    type: "string", 
                    enum: ["numero", "data_nomeacao", "honorarios", "valor_recebimento", "valor_causa", "data_prazo", "data_pericia_agendada"],
                    description: "Coluna para ordenar" 
                  },
                  ascending: { type: "boolean", description: "true para ordem crescente, false para decrescente" }
                }
              },
              limit: { type: "integer", description: "Limite de resultados (padrão: 10)" }
            }
          }
        }
      }
    ];

    // Build messages for OpenAI
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: message }
    ];

    console.log('Calling OpenAI...');
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        tools,
        tool_choice: 'auto',
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI error:', errorText);
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    console.log('OpenAI response:', JSON.stringify(openaiData, null, 2));

    const choice = openaiData.choices[0];
    const assistantMessage = choice.message;

    // Check if tool calls were made
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      console.log(`Processing ${assistantMessage.tool_calls.length} tool calls...`);
      
      // Process all tool calls in parallel
      const toolResults = await Promise.all(
        assistantMessage.tool_calls.map(async (toolCall: any) => {
          const functionName = toolCall.function.name;
          const functionArgs = JSON.parse(toolCall.function.arguments);

          if (functionName === 'query_pericias') {
            console.log('Querying pericias with filters:', functionArgs.filters);
            console.log('Order by:', functionArgs.order_by);
            
            // Build Supabase query
            let query = supabase.from('pericias').select('*');
            
            const filters = functionArgs.filters || {};
            
            if (filters.numero) {
              query = query.eq('numero', filters.numero);
            }
            if (filters.numero_processo) {
              query = query.ilike('numero_processo', `%${filters.numero_processo}%`);
            }
            if (filters.status) {
              query = query.eq('status', filters.status);
            }
            if (filters.vara) {
              query = query.ilike('vara', `%${filters.vara}%`);
            }
            if (filters.perito) {
              query = query.ilike('perito', `%${filters.perito}%`);
            }
            if (filters.cidade) {
              query = query.ilike('cidade', `%${filters.cidade}%`);
            }
            if (filters.requerente) {
              query = query.ilike('requerente', `%${filters.requerente}%`);
            }
            if (filters.requerido) {
              query = query.ilike('requerido', `%${filters.requerido}%`);
            }
            
            // Handle NR arrays - check if all specified values are contained
            if (filters.nr15_contains && filters.nr15_contains.length > 0) {
              query = query.contains('nr15', filters.nr15_contains);
            }
            if (filters.nr16_contains && filters.nr16_contains.length > 0) {
              query = query.contains('nr16', filters.nr16_contains);
            }
            
            // Apply ordering if specified
            if (functionArgs.order_by && functionArgs.order_by.column) {
              query = query.order(functionArgs.order_by.column, { 
                ascending: functionArgs.order_by.ascending !== false 
              });
            }
            
            query = query.limit(functionArgs.limit || 10);
            
            const { data, error } = await query;
            
            if (error) {
              console.error('Supabase query error:', error);
              throw error;
            }

            console.log(`Found ${data?.length || 0} pericias for tool call ${toolCall.id}`);

            return {
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify({ 
                count: data?.length || 0, 
                results: data 
              })
            };
          }

          return null;
        })
      );

      // Filter out null results
      const validToolResults = toolResults.filter(result => result !== null);

      // Send results back to OpenAI for final response
      const finalMessages = [
        { role: "system", content: systemPrompt },
        ...conversationHistory,
        { role: "user", content: message },
        assistantMessage,
        ...validToolResults
      ];

      const finalResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: finalMessages,
        }),
      });

      if (!finalResponse.ok) {
        throw new Error('Failed to get final response from OpenAI');
      }

      const finalData = await finalResponse.json();
      const finalAnswer = finalData.choices[0].message.content;

      return new Response(
        JSON.stringify({ 
          response: finalAnswer,
          resultsCount: validToolResults.reduce((sum, result) => {
            const parsed = JSON.parse(result.content);
            return sum + (parsed.count || 0);
          }, 0)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If no tool call, return direct response
    return new Response(
      JSON.stringify({ 
        response: assistantMessage.content 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        response: 'Desculpe, ocorreu um erro ao processar sua pergunta. Por favor, tente novamente.' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
