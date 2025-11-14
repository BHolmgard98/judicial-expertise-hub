import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AnexosNRChart = () => {
  const [nr15Data, setNr15Data] = useState<any[]>([]);
  const [nr16Data, setNr16Data] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: pericias } = await supabase
      .from("pericias")
      .select("nr15, nr16");

    if (pericias) {
      // Processar NR15
      const nr15Count: { [key: number]: number } = {};
      pericias.forEach((p) => {
        if (p.nr15 && Array.isArray(p.nr15)) {
          p.nr15.forEach((nr: number) => {
            nr15Count[nr] = (nr15Count[nr] || 0) + 1;
          });
        }
      });

      const nr15ChartData = Object.entries(nr15Count)
        .map(([nr, count]) => ({
          anexo: `NR15 - Anexo ${nr}`,
          quantidade: count,
        }))
        .sort((a, b) => parseInt(a.anexo.split(" ")[3]) - parseInt(b.anexo.split(" ")[3]));

      setNr15Data(nr15ChartData);

      // Processar NR16
      const nr16Count: { [key: number]: number } = {};
      pericias.forEach((p) => {
        if (p.nr16 && Array.isArray(p.nr16)) {
          p.nr16.forEach((nr: number) => {
            nr16Count[nr] = (nr16Count[nr] || 0) + 1;
          });
        }
      });

      const nr16ChartData = Object.entries(nr16Count)
        .map(([nr, count]) => ({
          anexo: `NR16 - Anexo ${nr}`,
          quantidade: count,
        }))
        .sort((a, b) => parseInt(a.anexo.split(" ")[3]) - parseInt(b.anexo.split(" ")[3]));

      setNr16Data(nr16ChartData);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Anexos NR15 e NR16</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="nr15">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="nr15">NR15</TabsTrigger>
            <TabsTrigger value="nr16">NR16</TabsTrigger>
          </TabsList>
          <TabsContent value="nr15">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={nr15Data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="anexo" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantidade" fill="hsl(var(--chart-1))" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="nr16">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={nr16Data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="anexo" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantidade" fill="hsl(var(--chart-2))" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AnexosNRChart;
