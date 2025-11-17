import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FilterState } from "@/pages/Dashboard";
import { STATUS_OPTIONS } from "@/lib/statusColors";
import { Checkbox } from "@/components/ui/checkbox";

interface DashboardFiltersProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
}

const DashboardFilters = ({ filters, setFilters }: DashboardFiltersProps) => {
  const [varaOptions, setVaraOptions] = useState<string[]>([]);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    const { data } = await supabase.from("pericias").select("vara");
    
    if (data) {
      const varas = [...new Set(data.map((p) => p.vara).filter(Boolean))];
      setVaraOptions(varas);
    }
  };

  const handleNr15Change = (value: number) => {
    const newNr15 = filters.nr15.includes(value)
      ? filters.nr15.filter((v) => v !== value)
      : [...filters.nr15, value];
    setFilters({ ...filters, nr15: newNr15 });
  };

  const handleNr16Change = (value: number) => {
    const newNr16 = filters.nr16.includes(value)
      ? filters.nr16.filter((v) => v !== value)
      : [...filters.nr16, value];
    setFilters({ ...filters, nr16: newNr16 });
  };

  const NR15_ANEXOS = [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  const NR16_ANEXOS = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={filters.status || "all"} onValueChange={(value) => setFilters({ ...filters, status: value === "all" ? "" : value })}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Pesquisar Reclamante</Label>
          <Input
            placeholder="Digite o nome..."
            value={filters.requerente}
            onChange={(e) => setFilters({ ...filters, requerente: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Vara</Label>
          <Select value={filters.vara || "all"} onValueChange={(value) => setFilters({ ...filters, vara: value === "all" ? "" : value })}>
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {varaOptions.map((vara) => (
                <SelectItem key={vara} value={vara}>
                  {vara}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Anexos NR15</Label>
          <div className="flex flex-wrap gap-3 p-3 border rounded-md bg-background">
            {NR15_ANEXOS.map((anexo) => (
              <div key={anexo} className="flex items-center space-x-2">
                <Checkbox
                  id={`nr15-${anexo}`}
                  checked={filters.nr15.includes(anexo)}
                  onCheckedChange={() => handleNr15Change(anexo)}
                />
                <label htmlFor={`nr15-${anexo}`} className="text-sm cursor-pointer">
                  Anexo {anexo}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Anexos NR16</Label>
          <div className="flex flex-wrap gap-3 p-3 border rounded-md bg-background">
            {NR16_ANEXOS.map((anexo) => (
              <div key={anexo} className="flex items-center space-x-2">
                <Checkbox
                  id={`nr16-${anexo}`}
                  checked={filters.nr16.includes(anexo)}
                  onCheckedChange={() => handleNr16Change(anexo)}
                />
                <label htmlFor={`nr16-${anexo}`} className="text-sm cursor-pointer">
                  Anexo {anexo}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardFilters;
