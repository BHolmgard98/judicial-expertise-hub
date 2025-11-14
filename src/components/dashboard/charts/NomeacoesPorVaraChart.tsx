import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const NomeacoesPorVaraChart = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: pericias } = await supabase
      .from("pericias")
      .select("vara")
      .order("vara");

    if (pericias) {
      const varaCount: { [key: string]: number } = {};
      
      pericias.forEach((p) => {
        const vara = p.vara || "Sem Vara";
        varaCount[vara] = (varaCount[vara] || 0) + 1;
      });

      const chartData = Object.entries(varaCount).map(([vara, count]) => ({
        vara: `Vara ${vara}`,
        quantidade: count,
      }));

      setData(chartData);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nomeações por Vara</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="vara" />
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

export default NomeacoesPorVaraChart;
