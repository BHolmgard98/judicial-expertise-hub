import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FilterState } from "@/pages/Dashboard";

interface DashboardFiltersProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
}

const DashboardFilters = ({ filters, setFilters }: DashboardFiltersProps) => {
  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  const [peritoOptions, setPeritoOptions] = useState<string[]>([]);
  const [varaOptions, setVaraOptions] = useState<string[]>([]);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    const { data } = await supabase.from("pericias").select("status, perito, vara");
    
    if (data) {
      const statuses = [...new Set(data.map((p) => p.status).filter(Boolean))];
      const peritos = [...new Set(data.map((p) => p.perito).filter(Boolean))];
      const varas = [...new Set(data.map((p) => p.vara).filter(Boolean))];
      
      setStatusOptions(statuses);
      setPeritoOptions(peritos);
      setVaraOptions(varas);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Perito</Label>
        <Select value={filters.perito} onValueChange={(value) => setFilters({ ...filters, perito: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            {peritoOptions.map((perito) => (
              <SelectItem key={perito} value={perito}>
                {perito}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Vara</Label>
        <Select value={filters.vara} onValueChange={(value) => setFilters({ ...filters, vara: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas</SelectItem>
            {varaOptions.map((vara) => (
              <SelectItem key={vara} value={vara}>
                {vara}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Data Inicial</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateFrom ? format(filters.dateFrom, "PP", { locale: ptBR }) : "Selecionar"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={filters.dateFrom}
              onSelect={(date) => setFilters({ ...filters, dateFrom: date })}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label>Data Final</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateTo ? format(filters.dateTo, "PP", { locale: ptBR }) : "Selecionar"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={filters.dateTo}
              onSelect={(date) => setFilters({ ...filters, dateTo: date })}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default DashboardFilters;
