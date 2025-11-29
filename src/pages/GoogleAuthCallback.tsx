import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GoogleAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setErrorMessage('Autorização negada pelo usuário');
      return;
    }

    if (code) {
      exchangeCode(code);
    } else {
      setStatus('error');
      setErrorMessage('Código de autorização não encontrado');
    }
  }, [searchParams]);

  const exchangeCode = async (code: string) => {
    try {
      const redirectUri = `${window.location.origin}/google-auth-callback`;
      
      const { data, error } = await supabase.functions.invoke('google-auth-callback', {
        body: { code, redirectUri }
      });

      if (error) throw error;

      if (data.success && data.refresh_token) {
        setRefreshToken(data.refresh_token);
        setStatus('success');
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.message);
    }
  };

  const copyToClipboard = async () => {
    if (refreshToken) {
      await navigator.clipboard.writeText(refreshToken);
      toast({
        title: "Copiado!",
        description: "Refresh token copiado para a área de transferência",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
            {status === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
            {status === 'error' && <XCircle className="h-5 w-5 text-destructive" />}
            Autorização Google
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Processando autorização...'}
            {status === 'success' && 'Autorização concluída com sucesso!'}
            {status === 'error' && 'Erro na autorização'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'loading' && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {status === 'success' && refreshToken && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Copie o refresh token abaixo e atualize no Supabase:
              </p>
              
              <div className="relative">
                <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto max-h-32">
                  {refreshToken}
                </pre>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="absolute top-2 right-2"
                  onClick={copyToClipboard}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Próximo passo:
                </p>
                <ol className="text-sm text-amber-700 dark:text-amber-300 list-decimal list-inside mt-2 space-y-1">
                  <li>Copie o refresh token acima</li>
                  <li>Acesse o Supabase Dashboard</li>
                  <li>Vá em Settings → Edge Functions → Secrets</li>
                  <li>Atualize o valor de GOOGLE_REFRESH_TOKEN</li>
                </ol>
              </div>

              <div className="flex gap-2">
                <Button asChild variant="outline" className="flex-1">
                  <a 
                    href="https://supabase.com/dashboard/project/pyyezrimfirhvihbhbqg/settings/functions" 
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Abrir Supabase Secrets
                  </a>
                </Button>
                <Button onClick={() => navigate('/dashboard/configuracoes')} className="flex-1">
                  Voltar às Configurações
                </Button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <p className="text-sm text-destructive">{errorMessage}</p>
              <Button onClick={() => navigate('/dashboard/configuracoes')} className="w-full">
                Voltar às Configurações
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleAuthCallback;
