import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Bell, Lock, Save, Loader2, Send, CheckCircle2, XCircle, KeyRound } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Configuracoes = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [authorizingGoogle, setAuthorizingGoogle] = useState(false);
  const [emailTestResult, setEmailTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [profile, setProfile] = useState({
    nome_perito: "",
    email_notificacoes: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserEmail(user.email || "");
        
        // Try to get existing profile
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (existingProfile) {
          setProfile({
            nome_perito: existingProfile.nome_perito || "",
            email_notificacoes: existingProfile.email_notificacoes || "",
          });
        } else {
          // Create profile if it doesn't exist
          const { error } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              nome_perito: "Engº Arthur Reis",
              email_notificacoes: user.email,
            });
          
          if (!error) {
            setProfile({
              nome_perito: "Engº Arthur Reis",
              email_notificacoes: user.email || "",
            });
          }
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          nome_perito: profile.nome_perito,
          email_notificacoes: profile.email_notificacoes,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Configurações salvas",
        description: "Suas configurações foram atualizadas com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    setResettingPassword(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/dashboard`,
      });

      if (error) throw error;

      toast({
        title: "Email enviado",
        description: "Um link para redefinir sua senha foi enviado para o seu email",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao enviar email",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setResettingPassword(false);
    }
  };

  const handleTestEmail = async () => {
    if (!profile.email_notificacoes) {
      toast({
        title: "Email não configurado",
        description: "Configure um email para notificações antes de testar",
        variant: "destructive",
      });
      return;
    }

    setTestingEmail(true);
    setEmailTestResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('test-email', {
        body: { email: profile.email_notificacoes }
      });

      if (error) throw error;
      
      if (data.success) {
        setEmailTestResult({ success: true, message: data.message });
        toast({
          title: "Email enviado!",
          description: "Verifique sua caixa de entrada",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      const errorMessage = error.message || "Erro desconhecido";
      setEmailTestResult({ success: false, message: errorMessage });
      toast({
        title: "Erro ao enviar email",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setTestingEmail(false);
    }
  };

  const handleGoogleAuth = async () => {
    setAuthorizingGoogle(true);
    try {
      const redirectUri = `${window.location.origin}/google-auth-callback`;
      
      console.log('Sending redirectUri:', redirectUri);
      
      const { data, error } = await supabase.functions.invoke('google-auth-url', {
        body: { redirectUri }
      });

      if (error) throw error;

      if (data.authUrl) {
        console.log('Auth URL:', data.authUrl);
        window.location.href = data.authUrl;
      } else {
        throw new Error('URL de autorização não gerada');
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
      setAuthorizingGoogle(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Gerencie suas preferências e informações de conta</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações do Perito
          </CardTitle>
          <CardDescription>
            Nome que aparecerá nas perícias cadastradas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome_perito">Nome do Perito</Label>
            <Input
              id="nome_perito"
              value={profile.nome_perito}
              onChange={(e) => setProfile({ ...profile, nome_perito: e.target.value })}
              placeholder="Ex: Engº Arthur Reis"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email de Login
          </CardTitle>
          <CardDescription>
            Email utilizado para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email_login">Email</Label>
            <Input
              id="email_login"
              value={userEmail}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              O email de login não pode ser alterado diretamente
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações por Email
          </CardTitle>
          <CardDescription>
            Email que receberá os avisos de prazos e perícias
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email_notificacoes">Email para Notificações</Label>
            <Input
              id="email_notificacoes"
              type="email"
              value={profile.email_notificacoes}
              onChange={(e) => setProfile({ ...profile, email_notificacoes: e.target.value })}
              placeholder="seu@email.com"
            />
            <p className="text-xs text-muted-foreground">
              Você receberá alertas 3 dias antes de perícias agendadas, prazos de laudo e esclarecimentos
            </p>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <Label>Validar Configuração de Email</Label>
            <p className="text-sm text-muted-foreground">
              Envie um email de teste para verificar se as notificações estão funcionando corretamente
            </p>
            <Button 
              variant="outline" 
              onClick={handleTestEmail}
              disabled={testingEmail || !profile.email_notificacoes}
            >
              {testingEmail ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Email de Teste
                </>
              )}
            </Button>
            
            {emailTestResult && (
              <Alert variant={emailTestResult.success ? "default" : "destructive"} className="mt-3">
                {emailTestResult.success ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription>{emailTestResult.message}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Segurança
          </CardTitle>
          <CardDescription>
            Gerenciar senha de acesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Redefinir Senha</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Um link para criar uma nova senha será enviado para seu email de login
            </p>
            <Button 
              variant="outline" 
              onClick={handleResetPassword}
              disabled={resettingPassword}
            >
              {resettingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Link de Redefinição"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Integração Google
          </CardTitle>
          <CardDescription>
            Autorizar acesso ao Gmail e Google Calendar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Reautorizar Aplicação</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Se o envio de emails não está funcionando, clique abaixo para reautorizar o acesso ao Gmail com as permissões necessárias.
            </p>
            <Button 
              variant="outline" 
              onClick={handleGoogleAuth}
              disabled={authorizingGoogle}
            >
              {authorizingGoogle ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecionando...
                </>
              ) : (
                <>
                  <KeyRound className="mr-2 h-4 w-4" />
                  Autorizar Google
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Configuracoes;
