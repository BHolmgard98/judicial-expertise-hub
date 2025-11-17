import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cell, Pie, PieChart, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { FilterState } from "@/pages/Dashboard";

interface StatusChartProps {
  filters: FilterState;
}

const COLORS = ["#006dad", "#0a1f33", "#17a2b8", "#ffc107", "#28a745"];

const StatusChart = ({ filters }: StatusChartProps) => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    let query = supabase
      .from("pericias")
      .select("status");

    if (filters.status) query = query.eq("status", filters.status as any);
    if (filters.vara) query = query.eq("vara", filters.vara);
    if (filters.requerente) query = query.ilike("requerente", `%${filters.requerente}%`);
    if (filters.nr15.length > 0) query = query.overlaps("nr15", filters.nr15);
    if (filters.nr16.length > 0) query = query.overlaps("nr16", filters.nr16);

    const { data: pericias } = await query;

    if (pericias) {
      const statusCount = pericias.reduce((acc: any, pericia) => {
        acc[pericia.status] = (acc[pericia.status] || 0) + 1;
        return acc;
      }, {});

      const chartData = Object.entries(statusCount).map(([name, value]) => ({
        name,
        value,
      }));

      setData(chartData);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perícias por Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default StatusChart;
