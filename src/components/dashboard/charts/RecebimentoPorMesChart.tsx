import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";

const RecebimentoPorMesChart = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: pericias } = await supabase
      .from("pericias")
      .select("valor_recebimento, vara")
      .not("valor_recebimento", "is", null);

    if (pericias) {
      const varaData: { [vara: string]: number } = {};

      pericias.forEach((p) => {
        const vara = p.vara || "Sem Vara";
        varaData[vara] = (varaData[vara] || 0) + (p.valor_recebimento || 0);
      });

      const chartData = Object.entries(varaData)
        .map(([vara, valor]) => ({
          vara,
          valor,
        }))
        .sort((a, b) => b.valor - a.valor);

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

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recebimentos por Vara</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={formatCurrency} />
            <YAxis type="category" dataKey="vara" width={80} />
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Bar dataKey="valor" name="Total Recebido">
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default RecebimentoPorMesChart;
