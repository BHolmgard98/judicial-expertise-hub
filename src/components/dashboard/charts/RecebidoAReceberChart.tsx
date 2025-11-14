import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const RecebidoAReceberChart = () => {
  const [data, setData] = useState<any[]>([]);
  const [totals, setTotals] = useState({ recebido: 0, aReceber: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: pericias } = await supabase
      .from("pericias")
      .select("honorarios, valor_recebimento");

    if (pericias) {
      let totalRecebido = 0;
      let totalHonorarios = 0;

      pericias.forEach((p) => {
        totalHonorarios += p.honorarios || 0;
        totalRecebido += p.valor_recebimento || 0;
      });

      const aReceber = totalHonorarios - totalRecebido;

      setTotals({ recebido: totalRecebido, aReceber: aReceber > 0 ? aReceber : 0 });

      const total = totalRecebido + (aReceber > 0 ? aReceber : 0);
      const percentRecebido = total > 0 ? (totalRecebido / total) * 100 : 0;
      const percentAReceber = total > 0 ? (aReceber > 0 ? (aReceber / total) * 100 : 0) : 0;

      setData([
        { name: "Recebido", value: totalRecebido, percent: percentRecebido },
        { name: "A Receber", value: aReceber > 0 ? aReceber : 0, percent: percentAReceber },
      ]);
    }
  };

  const COLORS = ["hsl(var(--chart-3))", "hsl(var(--chart-1))"];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Valores Recebidos vs A Receber</CardTitle>
        <div className="flex gap-4 text-sm mt-2">
          <span className="text-green-600">Recebido: {formatCurrency(totals.recebido)}</span>
          <span className="text-blue-600">A Receber: {formatCurrency(totals.aReceber)}</span>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${percent.toFixed(1)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{ 
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)"
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default RecebidoAReceberChart;
