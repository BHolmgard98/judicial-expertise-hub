import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { differenceInDays } from "date-fns";

const PrazoEntregaChart = () => {
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState({ adiantadas: 0, atrasadas: 0, noPrazo: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: pericias } = await supabase
      .from("pericias")
      .select("data_prazo, data_entrega, numero")
      .not("data_prazo", "is", null)
      .not("data_entrega", "is", null);

    if (pericias) {
      let adiantadas = 0;
      let atrasadas = 0;
      let noPrazo = 0;

      const chartData = pericias.map((p, index) => {
        const diasDiferenca = differenceInDays(
          new Date(p.data_entrega!),
          new Date(p.data_prazo!)
        );

        if (diasDiferenca < 0) adiantadas++;
        else if (diasDiferenca > 0) atrasadas++;
        else noPrazo++;

        return {
          index: index + 1,
          dias: diasDiferenca,
          numero: p.numero || index + 1,
          status: diasDiferenca < 0 ? "Adiantado" : diasDiferenca > 0 ? "Atrasado" : "No Prazo",
        };
      });

      setData(chartData);
      setStats({ adiantadas, atrasadas, noPrazo });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prazo vs Data de Entrega</CardTitle>
        <div className="flex gap-4 text-sm mt-2">
          <span className="text-green-600">Adiantadas: {stats.adiantadas}</span>
          <span className="text-blue-600">No Prazo: {stats.noPrazo}</span>
          <span className="text-red-600">Atrasadas: {stats.atrasadas}</span>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="index" 
              name="Perícia" 
              label={{ value: "Perícias", position: "insideBottom", offset: -5 }}
            />
            <YAxis 
              dataKey="dias" 
              name="Dias" 
              label={{ value: "Dias (Negativo = Adiantado)", angle: -90, position: "insideLeft" }}
            />
            <Tooltip 
              cursor={{ strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background border rounded p-2 shadow-lg">
                      <p className="font-semibold">Perícia #{data.numero}</p>
                      <p className={data.dias < 0 ? "text-green-600" : data.dias > 0 ? "text-red-600" : "text-blue-600"}>
                        {Math.abs(data.dias)} dias {data.status.toLowerCase()}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="3 3" />
            <Scatter 
              name="Perícias" 
              data={data} 
              fill="hsl(var(--primary))"
              shape={(props: any) => {
                const { cx, cy, payload } = props;
                const color = payload.dias < 0 ? "hsl(var(--chart-3))" : payload.dias > 0 ? "hsl(var(--destructive))" : "hsl(var(--chart-1))";
                return <circle cx={cx} cy={cy} r={4} fill={color} />;
              }}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PrazoEntregaChart;
