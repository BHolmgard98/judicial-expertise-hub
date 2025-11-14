import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ImportarPericias = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo Excel",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Usuário não autenticado");
      }

      // Criar FormData com o arquivo
      const formData = new FormData();
      formData.append('file', file);

      // Chamar a edge function
      const { data, error } = await supabase.functions.invoke('import-excel', {
        body: formData,
      });

      if (error) throw error;

      toast({
        title: "Importação concluída!",
        description: `${data.successful} perícias importadas com sucesso. ${data.failed > 0 ? `${data.failed} erros.` : ''}`,
      });

      // Limpar o input
      setFile(null);
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      // Recarregar a página após 2 segundos
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "Erro na importação",
        description: error.message || "Erro ao importar arquivo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importar Perícias do Excel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="excel-file">Selecione o arquivo Excel (.xlsx ou .xls)</Label>
          <Input
            id="excel-file"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            disabled={loading}
          />
        </div>
        
        <Button onClick={handleImport} disabled={loading || !file}>
          <Upload className="w-4 h-4 mr-2" />
          {loading ? "Importando..." : "Importar Perícias"}
        </Button>
        
        {file && (
          <p className="text-sm text-muted-foreground">
            Arquivo selecionado: {file.name}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ImportarPericias;