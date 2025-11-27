import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PericiaData {
  tipo?: string; // "prazo_esclarecimento" ou undefined para perícia
  requerente: string;
  requerido?: string;
  numero_processo?: string;
  data_pericia_agendada?: string;
  data_prazo?: string;
  horario?: string;
  endereco?: string;
  observacoes?: string;
  link_processo?: string;
  funcao?: string;
  nr15?: number[];
  nr16?: number[];
}

async function getAccessToken() {
  const clientId = Deno.env.get('GOOGLE_CLIENTE_ID');
  const clientSecret = Deno.env.get('GOOGLE_CLIENTE_SECRET');
  const refreshToken = Deno.env.get('GOOGLE_REFRESH_TOKEN');

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing Google OAuth credentials');
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Error getting access token:', error);
    throw new Error('Failed to get access token');
  }

  const data = await response.json();
  return data.access_token;
}

function buildEquipmentList(nr15: number[]): string {
  if (!nr15 || nr15.length === 0) {
    return 'Equipamentos a levar: Nenhum';
  }

  const hasRequiredAnnexes = nr15.some(anexo => [1, 3, 8].includes(anexo));
  
  if (!hasRequiredAnnexes) {
    return 'Equipamentos a levar: Nenhum';
  }

  const equipment: string[] = [];
  
  if (nr15.includes(1)) {
    equipment.push('AUDIODOSÍMETRO / CALIBRADOR ACÚSTICO');
  }
  if (nr15.includes(3)) {
    equipment.push('MEDIDOR DE CALOR (IBUTG)');
  }
  if (nr15.includes(8)) {
    equipment.push('VIBRAÇÃO');
  }

  return `Equipamentos a levar:\n${equipment.map((eq, idx) => `${idx + 1} - ${eq}`).join('\n')}`;
}

function buildEventDescription(pericia: PericiaData): string {
  const tipo = pericia.tipo || 'pericia';
  
  // Se for prazo (entrega ou esclarecimento), descrição simplificada
  if (tipo === 'prazo_esclarecimento') {
    return `Processo: ${pericia.numero_processo || 'Não informado'}
Reclamante: ${pericia.requerente}
Prazo para entrega de esclarecimentos.`.trim();
  }
  
  if (tipo === 'prazo_entrega') {
    return `Processo: ${pericia.numero_processo || 'Não informado'}
Reclamante: ${pericia.requerente}
Prazo para entrega do laudo pericial.`.trim();
  }

  const nr15Text = pericia.nr15 && pericia.nr15.length > 0
    ? `Anexo da NR-15 a ser avaliado: ${pericia.nr15.join(', ')}`
    : '';
  
  const nr16Text = pericia.nr16 && pericia.nr16.length > 0
    ? `Anexo da NR-16 a ser avaliado: ${pericia.nr16.join(', ')}`
    : '';

  const equipment = buildEquipmentList(pericia.nr15 || []);

  return `${pericia.observacoes ? pericia.observacoes + '\n\n' : ''}Reclamada: ${pericia.requerido || 'Não informada'}
Link do Processo: ${pericia.link_processo || 'Não informado'}
Função: ${pericia.funcao || 'Não informada'}

${nr15Text}
${nr16Text}

${equipment}`.trim();
}

async function createCalendarEvent(pericia: PericiaData) {
  const accessToken = await getAccessToken();

  // Determina qual data usar baseado no tipo
  const tipo = pericia.tipo || 'pericia';
  const isPrazo = tipo === 'prazo_esclarecimento' || tipo === 'prazo_entrega';
  const dateSource = isPrazo ? pericia.data_prazo : pericia.data_pericia_agendada;
  
  if (!dateSource) {
    throw new Error('Data não informada');
  }

  // Garante que a data está no formato correto YYYY-MM-DD
  const dateOnly = dateSource.split('T')[0];
  
  // Para prazos, usa horário padrão
  // Para perícia, usa o horário informado
  const timeString = isPrazo ? '09:00' : (pericia.horario || '09:00').substring(0, 5);
  const startDateTime = `${dateOnly}T${timeString}:00`;
  
  // Calcula horário de término
  const [hours, minutes] = timeString.split(':');
  let endHour = parseInt(hours) + (isPrazo ? 1 : 2);
  if (endHour >= 24) endHour = 23;
  const endDateTime = `${dateOnly}T${endHour.toString().padStart(2, '0')}:${minutes}:00`;

  console.log('Date processing:', { 
    tipo,
    original: dateSource, 
    dateOnly, 
    timeString, 
    startDateTime, 
    endDateTime 
  });

  // Define o título do evento baseado no tipo
  let summary: string;
  switch (tipo) {
    case 'prazo_esclarecimento':
      summary = `PRAZO ESCLARECIMENTO - ${pericia.requerente}`;
      break;
    case 'prazo_entrega':
      summary = `PRAZO ENTREGA LAUDO - ${pericia.requerente}`;
      break;
    default:
      summary = `PERÍCIA - ${pericia.requerente}`;
  }

  const event = {
    summary,
    location: pericia.endereco || '',
    description: buildEventDescription(pericia),
    start: {
      dateTime: startDateTime,
      timeZone: 'America/Sao_Paulo',
    },
    end: {
      dateTime: endDateTime,
      timeZone: 'America/Sao_Paulo',
    },
  };

  console.log('Creating calendar event:', JSON.stringify(event, null, 2));

  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('Error creating calendar event:', error);
    throw new Error(`Failed to create calendar event: ${error}`);
  }

  const result = await response.json();
  console.log('Calendar event created successfully:', result.id);
  return result;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const pericia: PericiaData = body.pericia || body;

    console.log('Received perícia data:', JSON.stringify({ pericia }, null, 2));

    // Validações - aceita tanto data_pericia_agendada quanto data_prazo
    const hasRequiredDate = pericia.data_pericia_agendada || pericia.data_prazo;
    if (!pericia.requerente || !hasRequiredDate) {
      throw new Error('Missing required fields: requerente or data (data_pericia_agendada ou data_prazo)');
    }

    const result = await createCalendarEvent(pericia);

    return new Response(
      JSON.stringify({ 
        success: true, 
        eventId: result.id,
        eventLink: result.htmlLink 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in google-calendar-sync function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
