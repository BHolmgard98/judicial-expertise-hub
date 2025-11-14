import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ImportarPericias = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const parseDate = (dateStr: string): string | null => {
    if (!dateStr || dateStr.trim() === '') return null;
    
    // Formato DD/MM/YY
    const parts = dateStr.trim().split('/');
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      let year = parts[2];
      
      // Converter ano de 2 dígitos para 4 dígitos
      if (year.length === 2) {
        const yearNum = parseInt(year);
        year = yearNum > 50 ? `19${year}` : `20${year}`;
      }
      
      return `${year}-${month}-${day}`;
    }
    return null;
  };

  const parseHonorarios = (value: string): number | null => {
    if (!value || value.trim() === '') return null;
    
    // Remove R$, espaços e pontos de milhares, substitui vírgula por ponto
    const cleaned = value.replace(/R\$\s*/g, '')
                         .replace(/\./g, '')
                         .replace(/,/g, '.')
                         .trim();
    
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  };

  const determineStatus = (
    dataEntrega: string | null,
    dataPrazo: string | null,
    sentenca: string | null
  ): string => {
    if (sentenca && sentenca.toLowerCase().includes('acordo')) {
      if (dataEntrega) {
        return 'HONORÁRIOS RECEBIDOS';
      }
      return 'ACORDO APÓS REALIZAÇÃO DA PERÍCIA';
    }
    
    if (dataEntrega) {
      return 'LAUDO/ESCLARECIMENTOS ENTREGUES';
    }
    
    if (dataPrazo) {
      return 'AGUARDANDO LAUDO';
    }
    
    return 'AGUARDANDO PERÍCIA';
  };

  const handleImport = async () => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Usuário não autenticado");

      // Dados extraídos do Excel fornecido
      const pericias = [
        {
          numero_processo: "1001150-46.2024.5.02.0076",
          requerente: "SAMUEL JOSE DE SOUZA",
          requerido: "NORTE BUSS TRANSPORTES S.A E OUTROS",
          vara: "76",
          data_nomeacao: "2024-08-28",
          data_prazo: "2024-10-31",
          data_entrega: "2024-10-12",
          honorarios: 800.00,
          observacoes: "Acordo"
        },
        {
          numero_processo: "1001514-72.2024.5.02.0058",
          requerente: "ROSEMEIRE CRISTINA PEREIRA",
          requerido: "OS ELOFORT SERVICOS S.A. E OUTROS",
          vara: "41",
          data_nomeacao: "2024-10-15",
          data_prazo: "2024-11-22",
          data_entrega: "2024-11-19",
          honorarios: 3000.00,
          observacoes: "Súmula 448"
        },
        {
          numero_processo: "1001527-25.2024.5.02.0041",
          requerente: "RENATO LEME XAVIER",
          requerido: "EMPRESA BRASILEIRA DE CORREIOS E TELEGRAFOS",
          vara: "41",
          data_nomeacao: "2024-10-18",
          data_prazo: "2024-11-22",
          data_entrega: "2024-11-22",
          honorarios: 3000.00,
          observacoes: "OJ 385"
        },
        {
          numero_processo: "1001635-54.2024.5.02.0041",
          requerente: "JAMILLY STEPHANIE SILVA CONCEICAO",
          requerido: "VERZANI & SANDRINI S.A. E OUTROS",
          vara: "41",
          data_nomeacao: "2024-10-22",
          data_prazo: "2024-11-22",
          data_entrega: "2024-11-21",
          honorarios: 3000.00,
          observacoes: "Súmula 448"
        },
        {
          numero_processo: "1001679-73.2024.5.02.0041",
          requerente: "WANDER WASHINGTON FERREIRA",
          requerido: "PORTO SEGURO COMPANHIA DE SEGUROS GERAIS",
          vara: "41",
          data_nomeacao: "2024-10-29",
          data_prazo: "2024-12-10",
          data_entrega: "2024-12-10",
          honorarios: 3200.00,
          observacoes: "OJ 385"
        },
        {
          numero_processo: "1001473-59.2024.5.02.0041",
          requerente: "MARIA DA CRUZ DA SILVA PEREIRA",
          requerido: "LUME SERVICOS E ENGENHARIA LTDA E OUTROS",
          vara: "41",
          data_nomeacao: "2024-10-31",
          data_prazo: "2024-12-10",
          data_entrega: null,
          honorarios: null,
          observacoes: "Acordo"
        },
        {
          numero_processo: "1002037-77.2024.5.02.0610",
          requerente: "JULIMARY ABREU DE CARVALHO LACERDA",
          requerido: "IMED - INSTITUTO DE MEDICINA, ESTUDOS E DESENVOLVIMENTO E OUTROS",
          vara: "41",
          data_nomeacao: "2024-11-06",
          data_prazo: "2024-12-10",
          data_entrega: "2024-12-11",
          honorarios: 806.00,
          observacoes: null
        },
        {
          numero_processo: "1001762-89.2024.5.02.0041",
          requerente: "ADRIANO VIEIRA SILVA",
          requerido: "CTS VIGILANCIA E SEGURANCA - EIRELI",
          vara: "41",
          data_nomeacao: "2024-11-11",
          data_prazo: "2024-12-10",
          data_entrega: "2024-12-10",
          honorarios: 3000.00,
          observacoes: null
        }
      ];

      // Inserir cada perícia
      let successCount = 0;
      let errorCount = 0;

      for (const pericia of pericias) {
        const status = determineStatus(
          pericia.data_entrega,
          pericia.data_prazo,
          pericia.observacoes
        );

        const { error } = await supabase.from("pericias").insert({
          numero_processo: pericia.numero_processo,
          requerente: pericia.requerente,
          requerido: pericia.requerido,
          vara: pericia.vara,
          perito: "Engº Arthur Reis",
          status: status as any,
          data_nomeacao: pericia.data_nomeacao,
          data_prazo: pericia.data_prazo,
          data_entrega: pericia.data_entrega,
          honorarios: pericia.honorarios,
          observacoes: pericia.observacoes,
          user_id: user.id,
        } as any);

        if (error) {
          console.error('Erro ao inserir perícia:', error);
          errorCount++;
        } else {
          successCount++;
        }
      }

      toast({
        title: "Importação concluída",
        description: `${successCount} perícias importadas com sucesso. ${errorCount} erros.`,
      });

      // Recarregar a página para mostrar os novos dados
      window.location.reload();

    } catch (error: any) {
      toast({
        title: "Erro na importação",
        description: error.message,
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
      <CardContent>
        <Button onClick={handleImport} disabled={loading}>
          <Upload className="w-4 h-4 mr-2" />
          {loading ? "Importando..." : "Importar 8 Perícias"}
        </Button>
        <p className="text-sm text-muted-foreground mt-2">
          Isso irá importar os 8 registros do arquivo Excel fornecido.
        </p>
      </CardContent>
    </Card>
  );
};

export default ImportarPericias;