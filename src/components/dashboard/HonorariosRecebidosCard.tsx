import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilterState } from "@/pages/Dashboard";
import { formatCurrency } from "@/lib/utils";

interface HonorariosRecebidosCardProps {
  filters: FilterState;
}

interface VaraTotal {
  vara: string;
  total: number;
  count: number;
}

const HonorariosRecebidosCard = ({ filters }: HonorariosRecebidosCardProps) => {
  const [totalGeral, setTotalGeral] = useState(0);
  const [totalPericias, setTotalPericias] = useState(0);
  const [valorPorVara, setValorPorVara] = useState<VaraTotal[]>([]);
  const [totalSentenca, setTotalSentenca] = useState(0);
  const [mediaDiasEspera, setMediaDiasEspera] = useState(0);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    let query = supabase
      .from("pericias")
      .select("vara, valor_recebimento, honorarios, data_nomeacao, data_recebimento")
      .eq("status", "HONORÁRIOS RECEBIDOS");

    if (filters.vara) query = query.eq("vara", filters.vara);
    if (filters.requerente) query = query.ilike("requerente", `%${filters.requerente}%`);
    if (filters.nr15.length > 0) query = query.overlaps("nr15", filters.nr15);
    if (filters.nr16.length > 0) query = query.overlaps("nr16", filters.nr16);

    const { data: pericias } = await query;

    if (pericias) {
      // Calculate total recebido
      const total = pericias.reduce((acc, p) => {
        return acc + (p.valor_recebimento || p.honorarios || 0);
      }, 0);
      setTotalGeral(total);
      setTotalPericias(pericias.length);

      // Calculate total sentença
      const totalHonorarios = pericias.reduce((acc, p) => {
        return acc + (p.honorarios || 0);
      }, 0);
      setTotalSentenca(totalHonorarios);

      // Calculate média de dias de espera
      const diasEspera = pericias
        .filter(p => p.data_nomeacao && p.data_recebimento)
        .map(p => {
          const dataNomeacao = new Date(p.data_nomeacao);
          const dataRecebimento = new Date(p.data_recebimento!);
          const diffTime = Math.abs(dataRecebimento.getTime() - dataNomeacao.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays;
        });
      
      const mediaDias = diasEspera.length > 0 
        ? Math.round(diasEspera.reduce((acc, dias) => acc + dias, 0) / diasEspera.length)
        : 0;
      setMediaDiasEspera(mediaDias);

      // Calculate per vara
      const varaMap: Record<string, VaraTotal> = {};
      pericias.forEach((p) => {
        const vara = p.vara || "Não informada";
        if (!varaMap[vara]) {
          varaMap[vara] = { vara, total: 0, count: 0 };
        }
        varaMap[vara].total += p.valor_recebimento || p.honorarios || 0;
        varaMap[vara].count += 1;
      });

      const varaList = Object.values(varaMap).sort((a, b) => b.total - a.total);
      setValorPorVara(varaList);
    }
  };

  // Only show when "HONORÁRIOS RECEBIDOS" filter is active
  if (filters.status !== "HONORÁRIOS RECEBIDOS") {
    return null;
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Resumo de Honorários Recebidos</span>
          <span className="text-2xl text-primary">{formatCurrency(totalGeral)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">Total Valor Sentença</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(totalSentenca)}</p>
          </div>
          
          <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">Total Valor Recebido</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(totalGeral)}</p>
          </div>

          <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">Média Tempo de Espera</p>
            <p className="text-2xl font-bold text-primary">{mediaDiasEspera} dias</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total de perícias com honorários recebidos</p>
            <p className="text-3xl font-bold">{totalPericias}</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">Valor por Vara</p>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {valorPorVara.map((item) => (
                <div key={item.vara} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                  <div>
                    <span className="font-medium">{item.vara}ª Vara</span>
                    <span className="text-sm text-muted-foreground ml-2">({item.count} perícia{item.count !== 1 ? 's' : ''})</span>
                  </div>
                  <span className="font-semibold text-primary">{formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HonorariosRecebidosCard;
