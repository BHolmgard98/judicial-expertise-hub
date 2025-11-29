import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailData {
  to: string;
  subject: string;
  body: string;
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

async function sendGmailEmail(emailData: EmailData) {
  const accessToken = await getAccessToken();

  // Create the email content in RFC 2822 format
  const emailContent = [
    `To: ${emailData.to}`,
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(emailData.subject)))}?=`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    emailData.body,
  ].join('\r\n');

  // Base64 URL encode the email
  const encodedEmail = btoa(unescape(encodeURIComponent(emailContent)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await fetch(
    'https://www.googleapis.com/gmail/v1/users/me/messages/send',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedEmail,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error}`);
  }

  const result = await response.json();
  console.log('Email sent successfully:', result.id);
  return result;
}

function buildEquipmentList(nr15: number[]): string {
  if (!nr15 || nr15.length === 0) {
    return '';
  }

  const hasRequiredAnnexes = nr15.some(anexo => [1, 3, 8].includes(anexo));
  
  if (!hasRequiredAnnexes) {
    return '';
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

  return `<p><strong>Equipamentos a levar:</strong></p><ul>${equipment.map(eq => `<li>${eq}</li>`).join('')}</ul>`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR');
}

async function checkAndSendNotifications() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const today = new Date();
  const threeDaysFromNow = new Date(today);
  threeDaysFromNow.setDate(today.getDate() + 3);
  const targetDate = threeDaysFromNow.toISOString().split('T')[0];

  console.log('Checking notifications for date:', targetDate);

  // Get all users with notification emails configured
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email_notificacoes')
    .not('email_notificacoes', 'is', null);

  if (!profiles || profiles.length === 0) {
    console.log('No profiles with notification emails configured');
    return { sent: 0 };
  }

  console.log(`Found ${profiles.length} profiles with notification emails`);

  let totalSent = 0;
  const baseUrl = 'https://pyyezrimfirhvihbhbqg.lovableproject.com';

  // Process notifications for each user
  for (const userProfile of profiles) {
    const userId = userProfile.id;
    const userEmail = userProfile.email_notificacoes;

    if (!userEmail) continue;

    const notifications: { type: string; pericia: any }[] = [];

    // 1. Check for pericias 3 days before for this user
    const { data: periciasAgendadas } = await supabase
      .from('pericias')
      .select('*')
      .eq('user_id', userId)
      .eq('data_pericia_agendada', targetDate)
      .eq('status', 'AGUARDANDO PERÍCIA');

    if (periciasAgendadas && periciasAgendadas.length > 0) {
      for (const pericia of periciasAgendadas) {
        notifications.push({ type: 'pericia', pericia });
      }
    }

    // 2. Check for laudo deadlines 3 days before for this user
    const { data: laudosVencendo } = await supabase
      .from('pericias')
      .select('*')
      .eq('user_id', userId)
      .eq('data_prazo', targetDate)
      .eq('status', 'AGUARDANDO LAUDO');

    if (laudosVencendo && laudosVencendo.length > 0) {
      for (const pericia of laudosVencendo) {
        notifications.push({ type: 'laudo', pericia });
      }
    }

    // 3. Check for esclarecimento deadlines 3 days before for this user
    const { data: esclarecimentosVencendo } = await supabase
      .from('pericias')
      .select('*')
      .eq('user_id', userId)
      .eq('prazo_esclarecimento', targetDate)
      .eq('status', 'AGUARDANDO ESCLARECIMENTOS');

    if (esclarecimentosVencendo && esclarecimentosVencendo.length > 0) {
      for (const pericia of esclarecimentosVencendo) {
        notifications.push({ type: 'esclarecimento', pericia });
      }
    }

    console.log(`Found ${notifications.length} notifications for user ${userId}`);

    // Send emails for each notification
    for (const notification of notifications) {
      const { type, pericia } = notification;
      let subject = '';
      let body = '';

      const periciaLink = `${baseUrl}/dashboard/aguardando-${type === 'pericia' ? 'pericia' : type === 'laudo' ? 'laudo' : 'esclarecimentos'}`;

      if (type === 'pericia') {
        subject = `⚠️ LEMBRETE: Perícia em 3 dias - ${pericia.requerente}`;
        body = `
          <h2>Lembrete de Perícia Agendada</h2>
          <p>Você tem uma perícia agendada para <strong>${formatDate(pericia.data_pericia_agendada)}</strong>.</p>
          
          <h3>Detalhes:</h3>
          <ul>
            <li><strong>Processo:</strong> ${pericia.numero_processo}</li>
            <li><strong>Reclamante:</strong> ${pericia.requerente}</li>
            <li><strong>Reclamada:</strong> ${pericia.requerido}</li>
            <li><strong>Função:</strong> ${pericia.funcao || 'Não informada'}</li>
            <li><strong>Horário:</strong> ${pericia.horario || 'Não informado'}</li>
            <li><strong>Local:</strong> ${pericia.endereco || 'Não informado'}</li>
          </ul>
          
          ${pericia.nr15 && pericia.nr15.length > 0 ? `<p><strong>NR-15:</strong> Anexos ${pericia.nr15.join(', ')}</p>` : ''}
          ${pericia.nr16 && pericia.nr16.length > 0 ? `<p><strong>NR-16:</strong> Anexos ${pericia.nr16.join(', ')}</p>` : ''}
          
          ${buildEquipmentList(pericia.nr15 || [])}
          
          ${pericia.observacoes ? `<p><strong>Observações:</strong> ${pericia.observacoes}</p>` : ''}
          
          ${pericia.link_processo ? `<p><a href="${pericia.link_processo}">Ver processo no PJe</a></p>` : ''}
          
          <p><a href="${periciaLink}" style="background-color: #006dad; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Ver no Sistema</a></p>
        `;
      } else if (type === 'laudo') {
        subject = `⚠️ URGENTE: Prazo de entrega do laudo em 3 dias - ${pericia.requerente}`;
        body = `
          <h2>Prazo de Entrega do Laudo</h2>
          <p>O prazo para entrega do laudo vence em <strong>${formatDate(pericia.data_prazo)}</strong>.</p>
          
          <h3>Detalhes:</h3>
          <ul>
            <li><strong>Processo:</strong> ${pericia.numero_processo}</li>
            <li><strong>Reclamante:</strong> ${pericia.requerente}</li>
            <li><strong>Reclamada:</strong> ${pericia.requerido}</li>
            <li><strong>Vara:</strong> ${pericia.vara}</li>
          </ul>
          
          ${pericia.link_processo ? `<p><a href="${pericia.link_processo}">Ver processo no PJe</a></p>` : ''}
          
          <p><a href="${periciaLink}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Ver Perícia</a></p>
        `;
      } else if (type === 'esclarecimento') {
        subject = `⚠️ URGENTE: Prazo de esclarecimento em 3 dias - ${pericia.requerente}`;
        body = `
          <h2>Prazo de Entrega de Esclarecimentos</h2>
          <p>O prazo para entrega dos esclarecimentos vence em <strong>${formatDate(pericia.prazo_esclarecimento)}</strong>.</p>
          
          <h3>Detalhes:</h3>
          <ul>
            <li><strong>Processo:</strong> ${pericia.numero_processo}</li>
            <li><strong>Reclamante:</strong> ${pericia.requerente}</li>
            <li><strong>Reclamada:</strong> ${pericia.requerido}</li>
            <li><strong>Vara:</strong> ${pericia.vara}</li>
          </ul>
          
          ${pericia.link_processo ? `<p><a href="${pericia.link_processo}">Ver processo no PJe</a></p>` : ''}
          
          <p><a href="${periciaLink}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Ver Perícia</a></p>
        `;
      }

      try {
        await sendGmailEmail({
          to: userEmail,
          subject,
          body,
        });
        console.log(`Email sent for ${type}: ${pericia.numero_processo} to ${userEmail}`);
        totalSent++;
      } catch (error) {
        console.error(`Failed to send email for ${type}: ${pericia.numero_processo}`, error);
      }
    }
  }

  return { sent: totalSent };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const result = await checkAndSendNotifications();

    return new Response(
      JSON.stringify({ 
        success: true, 
        ...result
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in send-email-notification function:', error);
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
