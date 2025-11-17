import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { FilterState } from "@/pages/Dashboard";
import { format, differenceInDays } from "date-fns";

interface PrazosChartProps {
  filters: FilterState;
}

const PrazosChart = ({ filters }: PrazosChartProps) => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    let query = supabase
      .from("pericias")
      .select("data_prazo, data_entrega, numero_processo")
      .not("data_prazo", "is", null);

    if (filters.status) query = query.eq("status", filters.status as any);
    if (filters.vara) query = query.eq("vara", filters.vara);
    if (filters.requerente) query = query.ilike("requerente", `%${filters.requerente}%`);
    if (filters.nr15.length > 0) query = query.overlaps("nr15", filters.nr15);
    if (filters.nr16.length > 0) query = query.overlaps("nr16", filters.nr16);

    const { data: pericias } = await query.limit(10);

    if (pericias) {
      const chartData = pericias
        .filter((p) => p.data_prazo)
        .map((pericia) => {
          const prazo = new Date(pericia.data_prazo);
          const entrega = pericia.data_entrega ? new Date(pericia.data_entrega) : new Date();
          const diasAtraso = differenceInDays(entrega, prazo);

          return {
            processo: pericia.numero_processo.slice(0, 10) + "...",
            prazo: format(prazo, "dd/MM/yy"),
            diasAtraso: diasAtraso > 0 ? diasAtraso : 0,
            diasAntecipacao: diasAtraso < 0 ? Math.abs(diasAtraso) : 0,
          };
        });

      setData(chartData);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prazos: Atraso vs. Antecipação</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="processo" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="diasAtraso" fill="#dc3545" name="Dias de Atraso" />
            <Bar dataKey="diasAntecipacao" fill="#28a745" name="Dias de Antecipação" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PrazosChart;
