import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const RecebimentoPorMesChart = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: pericias } = await supabase
      .from("pericias")
      .select("data_recebimento, valor_recebimento, vara")
      .not("data_recebimento", "is", null)
      .not("valor_recebimento", "is", null)
      .order("data_recebimento");

    if (pericias) {
      const monthData: { [key: string]: { [vara: string]: number } } = {};

      pericias.forEach((p) => {
        const month = format(new Date(p.data_recebimento!), "MMM/yyyy", { locale: ptBR });
        const vara = `Vara ${p.vara}`;
        
        if (!monthData[month]) {
          monthData[month] = {};
        }
        
        monthData[month][vara] = (monthData[month][vara] || 0) + (p.valor_recebimento || 0);
      });

      // Obter todas as varas únicas
      const allVaras = new Set<string>();
      Object.values(monthData).forEach(month => {
        Object.keys(month).forEach(vara => allVaras.add(vara));
      });

      const chartData = Object.entries(monthData).map(([month, varas]) => ({
        mes: month,
        ...varas,
      }));

      setData(chartData);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recebimento por Mês e Vara</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend />
            {data.length > 0 && Object.keys(data[0])
              .filter(key => key !== "mes")
              .map((vara, index) => (
                <Line 
                  key={vara}
                  type="monotone" 
                  dataKey={vara} 
                  stroke={`hsl(var(--chart-${(index % 5) + 1}))`}
                  strokeWidth={2}
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default RecebimentoPorMesChart;
