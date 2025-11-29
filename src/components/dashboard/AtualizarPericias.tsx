import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ExcelJS from "exceljs";

const AtualizarPericias = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const downloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Modelo Atualização", {
      properties: { tabColor: { argb: "FF10B981" } },
    });

    // Define as colunas
    worksheet.columns = [
      { header: "Nº Processo*", key: "numero_processo", width: 25 },
      { header: "Nº", key: "numero", width: 8 },
      { header: "Status", key: "status", width: 25 },
      { header: "Nº Vara", key: "vara", width: 15 },
      { header: "Reclamante", key: "requerente", width: 25 },
      { header: "Reclamada", key: "requerido", width: 25 },
      { header: "Data Nomeação", key: "data_nomeacao", width: 15 },
      { header: "Prazo Entrega", key: "data_prazo", width: 15 },
      { header: "Data Perícia", key: "data_pericia_agendada", width: 15 },
      { header: "Horário", key: "horario", width: 12 },
      { header: "Data Entrega", key: "data_entrega", width: 15 },
      { header: "Prazo Esclarec.", key: "prazo_esclarecimento", width: 15 },
      { header: "Data Esclarec.", key: "data_esclarecimento", width: 15 },
      { header: "Data Recebimento", key: "data_recebimento", width: 15 },
      { header: "Cidade", key: "cidade", width: 18 },
      { header: "Endereço", key: "endereco", width: 30 },
      { header: "Função", key: "funcao", width: 18 },
      { header: "Perito", key: "perito", width: 20 },
      { header: "Valor da Causa", key: "valor_causa", width: 15 },
      { header: "Honorários", key: "honorarios", width: 15 },
      { header: "Valor Recebido", key: "valor_recebimento", width: 15 },
      { header: "Deslocamento", key: "deslocamento", width: 18 },
      { header: "Estação", key: "estacao", width: 20 },
      { header: "Nº Linha", key: "linha_numero", width: 15 },
      { header: "Cor Linha", key: "linha_cor", width: 12 },
      { header: "Link Processo", key: "link_processo", width: 40 },
      { header: "E-mail Reclamante", key: "email_reclamante", width: 25 },
      { header: "E-mail Reclamada", key: "email_reclamada", width: 25 },
      { header: "Observações", key: "observacoes", width: 35 },
    ];

    // Estiliza o cabeçalho
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF10B981" },
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.height = 25;

    // Adicionar linha de exemplo
    const exampleRow = worksheet.addRow({
      numero_processo: "0001234-56.2024.5.02.0001",
      numero: 1,
      status: "AGUARDANDO LAUDO",
      vara: "1ª Vara do Trabalho",
      requerente: "João da Silva",
      requerido: "Empresa ABC Ltda",
      data_nomeacao: "01/01/2024",
      data_prazo: "15/01/2024",
      data_pericia_agendada: "20/01/2024",
      horario: "14:00",
      data_entrega: "",
      prazo_esclarecimento: "",
      data_esclarecimento: "",
      data_recebimento: "",
      cidade: "São Paulo",
      endereco: "Rua Exemplo, 123",
      funcao: "Operador",
      perito: "Engº Arthur Reis",
      valor_causa: "50000",
      honorarios: "3000",
      valor_recebimento: "",
      deslocamento: "Metrô",
      estacao: "Sé",
      linha_numero: "1",
      linha_cor: "Azul",
      link_processo: "https://pje.trt2.jus.br/...",
      email_reclamante: "joao@email.com",
      email_reclamada: "empresa@email.com",
      observacoes: "Observação de exemplo",
    });

    exampleRow.font = { italic: true, color: { argb: "FF6B7280" } };
    exampleRow.alignment = { vertical: "middle", wrapText: true };

    // Adicionar bordas
    worksheet.eachRow({ includeEmpty: false }, (row) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FFD1D5DB" } },
          left: { style: "thin", color: { argb: "FFD1D5DB" } },
          bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
          right: { style: "thin", color: { argb: "FFD1D5DB" } },
        };
      });
    });

    // Adicionar aba de instruções
    const instructionsSheet = workbook.addWorksheet("Instruções");
    instructionsSheet.columns = [
      { header: "", key: "instrucao", width: 100 },
    ];

    const instructions = [
      "=== INSTRUÇÕES PARA ATUALIZAÇÃO EM MASSA ===",
      "",
      "1. O campo 'Nº Processo*' é OBRIGATÓRIO e usado para identificar qual perícia será atualizada.",
      "",
      "2. Preencha APENAS os campos que deseja atualizar. Campos vazios serão ignorados.",
      "",
      "3. Formatos aceitos:",
      "   - Datas: DD/MM/AAAA (ex: 01/01/2024)",
      "   - Horário: HH:MM (ex: 14:00)",
      "   - Valores monetários: número simples (ex: 3000 ou 3000.50)",
      "",
      "4. Status válidos:",
      "   - Aguardando",
      "   - AGUARDANDO LAUDO",
      "   - AGUARDANDO DATA DA PERÍCIA",
      "   - AGUARDANDO DOCUMENTOS - RECTE.",
      "   - AGUARDANDO DOCUMENTOS - RECDA.",
      "   - PERÍCIA AGENDADA",
      "   - LAUDO/ESCLARECIMENTOS ENTREGUES",
      "   - ACORDO APÓS REALIZAÇÃO DA PERÍCIA",
      "   - FINALIZADO EM ACORDO ANTES DA PERÍCIA",
      "   - HONORÁRIOS RECEBIDOS",
      "",
      "5. Apague a linha de exemplo antes de importar.",
      "",
      "6. Você pode atualizar várias perícias de uma vez, cada uma em uma linha.",
    ];

    instructions.forEach((text) => {
      instructionsSheet.addRow({ instrucao: text });
    });

    // Estilizar primeira linha das instruções
    const firstInstructionRow = instructionsSheet.getRow(1);
    firstInstructionRow.font = { bold: true, size: 14 };

    // Gerar arquivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `modelo_atualizacao_pericias.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Modelo baixado!",
      description: "Preencha o modelo e importe para atualizar as perícias.",
    });
  };

  const handleUpdate = async () => {
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

      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('update-pericias-excel', {
        body: formData,
      });

      if (error) throw error;

      toast({
        title: "Atualização concluída!",
        description: `${data.successful} perícias atualizadas com sucesso. ${data.notFound > 0 ? `${data.notFound} não encontradas.` : ''} ${data.failed > 0 ? `${data.failed} erros.` : ''}`,
      });

      setFile(null);
      const fileInput = document.getElementById('update-excel-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error: any) {
      console.error('Update error:', error);
      toast({
        title: "Erro na atualização",
        description: error.message || "Erro ao atualizar perícias",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Atualizar Perícias em Massa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={downloadTemplate} className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Baixar Modelo
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="update-excel-file">Selecione o arquivo preenchido (.xlsx)</Label>
          <Input
            id="update-excel-file"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            disabled={loading}
          />
        </div>
        
        <Button onClick={handleUpdate} disabled={loading || !file} className="w-full">
          <Upload className="w-4 h-4 mr-2" />
          {loading ? "Atualizando..." : "Atualizar Perícias"}
        </Button>
        
        {file && (
          <p className="text-sm text-muted-foreground">
            Arquivo selecionado: {file.name}
          </p>
        )}

        <p className="text-xs text-muted-foreground">
          Use o Nº do Processo para identificar qual perícia atualizar. Campos vazios serão ignorados.
        </p>
      </CardContent>
    </Card>
  );
};

export default AtualizarPericias;
