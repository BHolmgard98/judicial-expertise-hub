import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getAccessToken() {
  const clientId = Deno.env.get('GOOGLE_CLIENTE_ID');
  const clientSecret = Deno.env.get('GOOGLE_CLIENTE_SECRET');
  const refreshToken = Deno.env.get('GOOGLE_REFRESH_TOKEN');

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Credenciais do Google não configuradas. Configure GOOGLE_CLIENTE_ID, GOOGLE_CLIENTE_SECRET e GOOGLE_REFRESH_TOKEN.');
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
    throw new Error('Falha ao obter token de acesso. Verifique se o refresh token está válido e tem permissão para Gmail.');
  }

  const data = await response.json();
  return data.access_token;
}

async function sendTestEmail(toEmail: string) {
  const accessToken = await getAccessToken();

  // Create the email content in RFC 2822 format
  const emailContent = [
    `To: ${toEmail}`,
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent('✅ Teste de Email - Sistema de Perícias')))}?=`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #006dad;">✅ Email de Teste</h2>
        <p>Este é um email de teste do Sistema de Perícias.</p>
        <p>Se você está recebendo este email, significa que as notificações estão configuradas corretamente!</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #666; font-size: 12px;">
          Este email foi enviado automaticamente pelo sistema.<br/>
          Data/Hora: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
        </p>
      </div>
    `,
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
    
    // Check for specific Gmail API errors
    if (error.includes('Mail service not enabled') || error.includes('accessNotConfigured')) {
      throw new Error('A API do Gmail não está habilitada. Ative-a em: https://console.cloud.google.com/apis/library/gmail.googleapis.com');
    }
    if (error.includes('Insufficient Permission') || error.includes('insufficientPermissions')) {
      throw new Error('Permissões insuficientes. O refresh token precisa do escopo gmail.send. Reautorize a aplicação.');
    }
    
    throw new Error(`Falha ao enviar email: ${error}`);
  }

  const result = await response.json();
  console.log('Test email sent successfully:', result.id);
  return result;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      throw new Error('Email de destino não informado');
    }

    console.log('Sending test email to:', email);
    const result = await sendTestEmail(email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email de teste enviado com sucesso!',
        messageId: result.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in test-email function:', error);
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
