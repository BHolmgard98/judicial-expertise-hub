import ExcelJS from "exceljs";
import { getStatusColor } from "./statusColors";

interface PericiaExport {
  numero?: number;
  vara: string;
  requerente: string;
  numero_processo: string;
  requerido: string;
  data_nomeacao: string;
  data_prazo?: string;
  data_pericia_agendada?: string;
  horario?: string;
  data_entrega?: string;
  prazo_esclarecimento?: string;
  status?: string;
  nr15?: number[];
  nr16?: number[];
  cidade?: string;
  endereco?: string;
  funcao?: string;
  perito: string;
  valor_causa?: number;
  honorarios?: number;
  valor_recebimento?: number;
  observacoes?: string;
}

const getStatusBackgroundColor = (status: string): string => {
  const colorClass = getStatusColor(status);
  
  // Mapeia as classes Tailwind para cores RGB hexadecimal
  const colorMap: Record<string, string> = {
    "bg-blue-100": "DBEAFE",
    "bg-yellow-100": "FEF3C7",
    "bg-gray-100": "F3F4F6",
    "bg-green-100": "D1FAE5",
    "bg-purple-100": "EDE9FE",
    "bg-red-100": "FEE2E2",
    "bg-orange-100": "FFEDD5",
    "bg-indigo-100": "E0E7FF",
    "bg-pink-100": "FCE7F3",
  };

  return colorMap[colorClass] || "FFFFFF";
};

const getStatusTextColor = (status: string): string => {
  const colorClass = getStatusColor(status);
  
  // Mapeia as classes Tailwind para cores RGB hexadecimal (texto)
  const colorMap: Record<string, string> = {
    "bg-blue-100": "1E40AF",
    "bg-yellow-100": "92400E",
    "bg-gray-100": "374151",
    "bg-green-100": "065F46",
    "bg-purple-100": "6B21A8",
    "bg-red-100": "991B1B",
    "bg-orange-100": "9A3412",
    "bg-indigo-100": "3730A3",
    "bg-pink-100": "9F1239",
  };

  return colorMap[colorClass] || "000000";
};

export const exportToExcel = async (
  pericias: PericiaExport[],
  fileName: string = "pericias_export"
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Perícias", {
    properties: { tabColor: { argb: "FF1E40AF" } },
  });

  // Define as colunas
  worksheet.columns = [
    { header: "Nº", key: "numero", width: 8 },
    { header: "Nº Vara", key: "vara", width: 15 },
    { header: "Reclamante", key: "requerente", width: 25 },
    { header: "Nº Processo", key: "numero_processo", width: 22 },
    { header: "Reclamada", key: "requerido", width: 25 },
    { header: "Data Nomeação", key: "data_nomeacao", width: 15 },
    { header: "Prazo Entrega", key: "data_prazo", width: 15 },
    { header: "Data Perícia", key: "data_pericia_agendada", width: 15 },
    { header: "Horário", key: "horario", width: 12 },
    { header: "Data Entrega", key: "data_entrega", width: 15 },
    { header: "Prazo Esclarec.", key: "prazo_esclarecimento", width: 15 },
    { header: "Status", key: "status", width: 20 },
    { header: "NR15", key: "nr15", width: 20 },
    { header: "NR16", key: "nr16", width: 20 },
    { header: "Cidade", key: "cidade", width: 18 },
    { header: "Endereço", key: "endereco", width: 30 },
    { header: "Função", key: "funcao", width: 18 },
    { header: "Perito", key: "perito", width: 20 },
    { header: "Valor da Causa", key: "valor_causa", width: 15 },
    { header: "Honorários", key: "honorarios", width: 15 },
    { header: "Valor Recebido", key: "valor_recebimento", width: 15 },
    { header: "Observações", key: "observacoes", width: 35 },
  ];

  // Estiliza o cabeçalho
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1E40AF" },
  };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  headerRow.height = 25;

  // Adiciona os dados
  pericias.forEach((pericia) => {
    const row = worksheet.addRow({
      numero: pericia.numero || "-",
      vara: pericia.vara,
      requerente: pericia.requerente,
      numero_processo: pericia.numero_processo,
      requerido: pericia.requerido,
      data_nomeacao: pericia.data_nomeacao ? formatDate(pericia.data_nomeacao) : "-",
      data_prazo: pericia.data_prazo ? formatDate(pericia.data_prazo) : "-",
      data_pericia_agendada: pericia.data_pericia_agendada ? formatDate(pericia.data_pericia_agendada) : "-",
      horario: pericia.horario || "-",
      data_entrega: pericia.data_entrega ? formatDate(pericia.data_entrega) : "-",
      prazo_esclarecimento: pericia.prazo_esclarecimento ? formatDate(pericia.prazo_esclarecimento) : "-",
      status: pericia.status || "-",
      nr15: pericia.nr15 ? pericia.nr15.join(", ") : "-",
      nr16: pericia.nr16 ? pericia.nr16.join(", ") : "-",
      cidade: pericia.cidade || "-",
      endereco: pericia.endereco || "-",
      funcao: pericia.funcao || "-",
      perito: pericia.perito,
      valor_causa: pericia.valor_causa ? formatCurrency(pericia.valor_causa) : "-",
      honorarios: pericia.honorarios ? formatCurrency(pericia.honorarios) : "-",
      valor_recebimento: pericia.valor_recebimento ? formatCurrency(pericia.valor_recebimento) : "-",
      observacoes: pericia.observacoes || "-",
    });

    // Aplica estilo à linha
    row.alignment = { vertical: "middle", wrapText: true };
    row.height = 20;

    // Estiliza a célula de status com cor
    if (pericia.status) {
      const statusCell = row.getCell("status");
      const bgColor = getStatusBackgroundColor(pericia.status);
      const textColor = getStatusTextColor(pericia.status);
      
      statusCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: `FF${bgColor}` },
      };
      statusCell.font = {
        color: { argb: `FF${textColor}` },
        bold: true,
      };
      statusCell.alignment = { vertical: "middle", horizontal: "center" };
    }

    // Aplica bordas a todas as células
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFD1D5DB" } },
        left: { style: "thin", color: { argb: "FFD1D5DB" } },
        bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
        right: { style: "thin", color: { argb: "FFD1D5DB" } },
      };
    });
  });

  // Adiciona filtros automáticos
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: worksheet.columns.length },
  };

  // Congela a primeira linha
  worksheet.views = [{ state: "frozen", xSplit: 0, ySplit: 1 }];

  // Gera o arquivo
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}_${new Date().toISOString().split("T")[0]}.xlsx`;
  link.click();
  window.URL.revokeObjectURL(url);
};

const formatDate = (dateString: string): string => {
  const parts = dateString.split("-");
  if (parts.length !== 3) return dateString;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const formatCurrency = (value: number): string => {
  return `R$ ${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
