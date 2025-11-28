import { format } from "date-fns";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { getStatusColor } from "@/lib/statusColors";
import { ExternalLink } from "lucide-react";

interface VisualizarPericiaProps {
  pericia: any;
}

const VisualizarPericia = ({ pericia }: VisualizarPericiaProps) => {
  if (!pericia) {
    return null;
  }

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return format(new Date(date), "dd/MM/yyyy");
  };

  const formatTime = (time: string | null) => {
    if (!time) return "-";
    return time;
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Detalhes da Perícia #{pericia.numero}</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-6 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Número</label>
            <p className="text-base">{pericia.numero || "-"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <div className="mt-1">
              <Badge className={getStatusColor(pericia.status)}>{pericia.status}</Badge>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Informações do Processo</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Número do Processo</label>
              <div className="flex items-center gap-2">
                {pericia.link_processo && (
                  <a
                    href={pericia.link_processo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80"
                    title="Abrir link do processo"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <p className="text-base">{pericia.numero_processo}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Cidade</label>
              <p className="text-base">{pericia.cidade || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nº da Vara</label>
              <p className="text-base">{pericia.vara}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Função</label>
              <p className="text-base">{pericia.funcao || "-"}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Partes</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Reclamante</label>
              <p className="text-base">{pericia.requerente}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email Reclamante</label>
              <p className="text-base">{pericia.email_reclamante || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Reclamada</label>
              <p className="text-base">{pericia.requerido}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email Reclamada</label>
              <p className="text-base">{pericia.email_reclamada || "-"}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Valores</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Valor da Causa</label>
              <p className="text-base">{formatCurrency(pericia.valor_causa)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Honorários</label>
              <p className="text-base">{formatCurrency(pericia.honorarios)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Valor do Recebimento</label>
              <p className="text-base">{formatCurrency(pericia.valor_recebimento)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">NR's</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">NR15</label>
              <p className="text-base">{pericia.nr15 && pericia.nr15.length > 0 ? pericia.nr15.join(", ") : "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">NR16</label>
              <p className="text-base">{pericia.nr16 && pericia.nr16.length > 0 ? pericia.nr16.join(", ") : "-"}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Datas e Prazos</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Data de Nomeação</label>
              <p className="text-base">{formatDate(pericia.data_nomeacao)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Data da Perícia Agendada</label>
              <p className="text-base">{formatDate(pericia.data_pericia_agendada)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Horário</label>
              <p className="text-base">{formatTime(pericia.horario)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Prazo de Entrega</label>
              <p className="text-base">{formatDate(pericia.data_prazo)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Data de Entrega</label>
              <p className="text-base">{formatDate(pericia.data_entrega)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Prazo de Esclarecimento</label>
              <p className="text-base">{formatDate(pericia.prazo_esclarecimento)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Data de Esclarecimento</label>
              <p className="text-base">{formatDate(pericia.data_esclarecimento)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Data de Recebimento</label>
              <p className="text-base">{formatDate(pericia.data_recebimento)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Informações Adicionais</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Perito</label>
              <p className="text-base">{pericia.perito}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Endereço</label>
              <p className="text-base">{pericia.endereco || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Deslocamento</label>
              <p className="text-base">{pericia.deslocamento || "-"}</p>
            </div>
            {pericia.deslocamento === "Transporte Público" && (
              <>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Estação</label>
                  <p className="text-base">{pericia.estacao || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nº Linha</label>
                  <p className="text-base">{pericia.linha_numero || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Cor</label>
                  <p className="text-base">{pericia.linha_cor || "-"}</p>
                </div>
              </>
            )}
            {pericia.observacoes && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Observações</label>
                <p className="text-base whitespace-pre-wrap">{pericia.observacoes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default VisualizarPericia;
