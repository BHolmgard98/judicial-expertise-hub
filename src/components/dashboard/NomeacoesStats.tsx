import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, CalendarCheck } from "lucide-react";

const NomeacoesStats = () => {
  const [totalNomeacoes, setTotalNomeacoes] = useState(0);
  const [nomeacoesMes, setNomeacoesMes] = useState(0);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    // Total de nomeações
    const { count: total } = await supabase
      .from("pericias")
      .select("*", { count: "exact", head: true });

    setTotalNomeacoes(total || 0);

    // Nomeações do mês atual
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const { count: mesAtual } = await supabase
      .from("pericias")
      .select("*", { count: "exact", head: true })
      .gte("data_nomeacao", firstDay.toISOString().split("T")[0])
      .lte("data_nomeacao", lastDay.toISOString().split("T")[0]);

    setNomeacoesMes(mesAtual || 0);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total de Nomeações
              </p>
              <h3 className="text-3xl font-bold text-primary mt-2">
                {totalNomeacoes}
              </h3>
            </div>
            <Calendar className="w-12 h-12 text-primary/60" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Nomeações Este Mês
              </p>
              <h3 className="text-3xl font-bold text-primary mt-2">
                {nomeacoesMes}
              </h3>
            </div>
            <CalendarCheck className="w-12 h-12 text-primary/60" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NomeacoesStats;
