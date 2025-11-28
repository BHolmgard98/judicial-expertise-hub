import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, FileText, Clock } from "lucide-react";

interface DeadlineAlertPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeadlineAlertPopup = ({ open, onOpenChange }: DeadlineAlertPopupProps) => {
  const navigate = useNavigate();
  const [laudoCount, setLaudoCount] = useState(0);
  const [esclarecimentoCount, setEsclarecimentoCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      checkDeadlines();
    }
  }, [open]);

  const checkDeadlines = async () => {
    setLoading(true);

    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    const todayStr = today.toISOString().split("T")[0];
    const threeDaysStr = threeDaysFromNow.toISOString().split("T")[0];

    // Perícias aguardando laudo com prazo em até 3 dias
    const { data: laudoData, error: laudoError } = await supabase
      .from("pericias")
      .select("id, data_prazo")
      .eq("status", "AGUARDANDO LAUDO" as any)
      .gte("data_prazo", todayStr)
      .lte("data_prazo", threeDaysStr);

    if (!laudoError && laudoData) {
      setLaudoCount(laudoData.length);
    }

    // Perícias aguardando esclarecimentos com prazo em até 3 dias
    const { data: esclarecimentoData, error: esclarecimentoError } = await supabase
      .from("pericias")
      .select("id, prazo_esclarecimento")
      .eq("status", "AGUARDANDO ESCLARECIMENTOS" as any)
      .gte("prazo_esclarecimento", todayStr)
      .lte("prazo_esclarecimento", threeDaysStr);

    if (!esclarecimentoError && esclarecimentoData) {
      setEsclarecimentoCount(esclarecimentoData.length);
    }

    setLoading(false);
  };

  const handleNavigateToLaudo = () => {
    onOpenChange(false);
    navigate("/dashboard/aguardando-laudo");
  };

  const handleNavigateToEsclarecimento = () => {
    onOpenChange(false);
    navigate("/dashboard/aguardando-esclarecimentos");
  };

  // Não mostrar se não há nenhum alerta
  if (!loading && laudoCount === 0 && esclarecimentoCount === 0) {
    return null;
  }

  return (
    <Dialog open={open && (laudoCount > 0 || esclarecimentoCount > 0 || loading)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="w-5 h-5" />
            Alertas de Prazo
          </DialogTitle>
          <DialogDescription>
            Existem perícias com prazos próximos de vencer
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-4 text-center text-muted-foreground">
            Verificando prazos...
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {laudoCount > 0 && (
              <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-foreground">
                      Perícias Aguardando Laudo
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {laudoCount} {laudoCount === 1 ? "perícia" : "perícias"} com prazo em até 3 dias
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNavigateToLaudo}
                >
                  Ver
                </Button>
              </div>
            )}

            {esclarecimentoCount > 0 && (
              <div className="flex items-center justify-between p-4 bg-sky-50 dark:bg-sky-950/20 rounded-lg border border-sky-200 dark:border-sky-800">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-sky-600" />
                  <div>
                    <p className="font-medium text-foreground">
                      Perícias Aguardando Esclarecimentos
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {esclarecimentoCount} {esclarecimentoCount === 1 ? "perícia" : "perícias"} com prazo em até 3 dias
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNavigateToEsclarecimento}
                >
                  Ver
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeadlineAlertPopup;
