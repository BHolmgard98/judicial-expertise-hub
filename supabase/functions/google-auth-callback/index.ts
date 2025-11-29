import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, redirectUri } = await req.json();
    
    const clientId = Deno.env.get('GOOGLE_CLIENTE_ID');
    const clientSecret = Deno.env.get('GOOGLE_CLIENTE_SECRET');
    
    if (!clientId || !clientSecret) {
      throw new Error('Credenciais do Google não configuradas');
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Token exchange error:', error);
      throw new Error('Falha ao trocar código por tokens');
    }

    const tokens = await tokenResponse.json();
    
    console.log('Tokens received successfully');
    console.log('Has refresh_token:', !!tokens.refresh_token);

    // Return the refresh token to be saved manually
    return new Response(
      JSON.stringify({ 
        success: true,
        refresh_token: tokens.refresh_token,
        message: 'Autorização concluída! Copie o refresh_token e atualize no Supabase Secrets.',
        instructions: 'Vá em Supabase > Settings > Edge Functions > Secrets e atualize GOOGLE_REFRESH_TOKEN com o valor abaixo:'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in callback:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
