import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const NomeacoesPorMesChart = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: pericias } = await supabase
      .from("pericias")
      .select("data_nomeacao")
      .order("data_nomeacao");

    if (pericias) {
      const mesCount: { [key: string]: number } = {};
      
      pericias.forEach((p) => {
        if (p.data_nomeacao) {
          const date = new Date(p.data_nomeacao);
          const mesAno = `${date.getMonth() + 1}/${date.getFullYear()}`;
          mesCount[mesAno] = (mesCount[mesAno] || 0) + 1;
        }
      });

      const chartData = Object.entries(mesCount).map(([mes, quantidade]) => ({
        mes,
        quantidade,
      }));

      setData(chartData);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nomeações por Mês</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="quantidade" fill="hsl(var(--primary))" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default NomeacoesPorMesChart;
