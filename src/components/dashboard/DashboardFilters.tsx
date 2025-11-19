import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FilterState } from "@/pages/Dashboard";
import { STATUS_OPTIONS } from "@/lib/statusColors";
import { Checkbox } from "@/components/ui/checkbox";
import { NR15_KEYS, NR16_KEYS, getNR15Label, getNR16Label } from "@/lib/nrAnexos";

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

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={filters.status || "all"} onValueChange={(value) => setFilters({ 
            ...filters, 
            status: value === "all" ? "" : value,
            // Limpar filtros dinâmicos ao mudar status
            dataNomeacao: "",
            dataAgendada: "",
            horario: "",
            dataEntrega: "",
            prazoEsclarecimento: "",
            vara: value === "all" || ["AGENDAR PERÍCIA", "AGUARDANDO PERÍCIA", "AGUARDANDO LAUDO", "AGUARDANDO ESCLARECIMENTOS"].includes(value) ? "" : filters.vara
          })}>
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

        {/* Filtro dinâmico baseado no status */}
        {filters.status === "AGENDAR PERÍCIA" ? (
          <div className="space-y-2">
            <Label>Data da Nomeação</Label>
            <Input
              type="date"
              value={filters.dataNomeacao}
              onChange={(e) => setFilters({ ...filters, dataNomeacao: e.target.value })}
            />
          </div>
        ) : filters.status === "AGUARDANDO PERÍCIA" ? (
          <>
            <div className="space-y-2">
              <Label>Data da Perícia Agendada</Label>
              <Input
                type="date"
                value={filters.dataAgendada}
                onChange={(e) => setFilters({ ...filters, dataAgendada: e.target.value })}
              />
            </div>
          </>
        ) : filters.status === "AGUARDANDO LAUDO" ? (
          <div className="space-y-2">
            <Label>Data de Entrega</Label>
            <Input
              type="date"
              value={filters.dataEntrega}
              onChange={(e) => setFilters({ ...filters, dataEntrega: e.target.value })}
            />
          </div>
        ) : filters.status === "AGUARDANDO ESCLARECIMENTOS" ? (
          <div className="space-y-2">
            <Label>Prazo de Esclarecimento</Label>
            <Input
              type="date"
              value={filters.prazoEsclarecimento}
              onChange={(e) => setFilters({ ...filters, prazoEsclarecimento: e.target.value })}
            />
          </div>
        ) : (
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
        )}

        {/* Horário para status "Aguardando Perícia" */}
        {filters.status === "AGUARDANDO PERÍCIA" && (
          <div className="space-y-2">
            <Label>Horário</Label>
            <Input
              type="time"
              value={filters.horario}
              onChange={(e) => setFilters({ ...filters, horario: e.target.value })}
            />
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Anexos NR15</Label>
          <div className="flex flex-wrap gap-3 p-3 border rounded-md bg-background">
            {NR15_KEYS.map((anexo) => (
              <div key={anexo} className="flex items-center space-x-2">
                <Checkbox
                  id={`nr15-${anexo}`}
                  checked={filters.nr15.includes(anexo)}
                  onCheckedChange={() => handleNr15Change(anexo)}
                />
                <label htmlFor={`nr15-${anexo}`} className="text-sm cursor-pointer">
                  {anexo} - {getNR15Label(anexo)}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Anexos NR16</Label>
          <div className="flex flex-wrap gap-3 p-3 border rounded-md bg-background">
            {NR16_KEYS.map((anexo) => (
              <div key={anexo} className="flex items-center space-x-2">
                <Checkbox
                  id={`nr16-${anexo}`}
                  checked={filters.nr16.includes(anexo)}
                  onCheckedChange={() => handleNr16Change(anexo)}
                />
                <label htmlFor={`nr16-${anexo}`} className="text-sm cursor-pointer">
                  {anexo} - {getNR16Label(anexo)}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filtros de Ano e Mês */}
      <div className="space-y-2">
        <Label>Período de Nomeação</Label>
        <div className="flex gap-2">
          <Select 
            value={filters.ano || "all"} 
            onValueChange={(value) => setFilters({ ...filters, ano: value === "all" ? "" : value })}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os anos</SelectItem>
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            value={filters.mes || "all"} 
            onValueChange={(value) => setFilters({ ...filters, mes: value === "all" ? "" : value })}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os meses</SelectItem>
              <SelectItem value="1">Janeiro</SelectItem>
              <SelectItem value="2">Fevereiro</SelectItem>
              <SelectItem value="3">Março</SelectItem>
              <SelectItem value="4">Abril</SelectItem>
              <SelectItem value="5">Maio</SelectItem>
              <SelectItem value="6">Junho</SelectItem>
              <SelectItem value="7">Julho</SelectItem>
              <SelectItem value="8">Agosto</SelectItem>
              <SelectItem value="9">Setembro</SelectItem>
              <SelectItem value="10">Outubro</SelectItem>
              <SelectItem value="11">Novembro</SelectItem>
              <SelectItem value="12">Dezembro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default DashboardFilters;
