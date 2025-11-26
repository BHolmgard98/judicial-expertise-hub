import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import DashboardFilters from "@/components/dashboard/DashboardFilters";
import StatusChart from "@/components/dashboard/StatusChart";
import PericiasTable from "@/components/dashboard/PericiasTable";
import NovaPericia from "@/components/dashboard/NovaPericia";
import ImportarPericias from "@/components/dashboard/ImportarPericias";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NomeacoesPorVaraChart from "@/components/dashboard/charts/NomeacoesPorVaraChart";
import AnexosNRChart from "@/components/dashboard/charts/AnexosNRChart";
import PrazoEntregaChart from "@/components/dashboard/charts/PrazoEntregaChart";
import RecebimentoPorMesChart from "@/components/dashboard/charts/RecebimentoPorMesChart";
import RecebidoAReceberChart from "@/components/dashboard/charts/RecebidoAReceberChart";
import NomeacoesStats from "@/components/dashboard/NomeacoesStats";
import NomeacoesPorMesChart from "@/components/dashboard/charts/NomeacoesPorMesChart";

export interface FilterState {
  status: string;
  requerente: string;
  vara: string;
  nr15: number[];
  nr16: number[];
  ano: string;
  mes: string;
  dataNomeacao: string;
  dataAgendada: string;
  horario: string;
  dataEntrega: string;
  prazoEsclarecimento: string;
}

const Dashboard = () => {
  const [filters, setFilters] = useState<FilterState>({
    status: "",
    requerente: "",
    vara: "",
    nr15: [],
    nr16: [],
    ano: "",
    mes: "",
    dataNomeacao: "",
    dataAgendada: "",
    horario: "",
    dataEntrega: "",
    prazoEsclarecimento: "",
  });
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Import Section */}
      <ImportarPericias />

      {/* Stats */}
      <NomeacoesStats />

      {/* Gráfico de Nomeações por Mês */}
      <NomeacoesPorMesChart />

      {/* Filters */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Filtros</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Perícia
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <NovaPericia onSuccess={(nr15, nr16) => {
                setOpen(false);
                setFilters({ ...filters, nr15, nr16 });
              }} />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <DashboardFilters filters={filters} setFilters={setFilters} />
        </CardContent>
      </Card>

      {/* Charts */}
      <StatusChart filters={filters} />

      {/* Analytics Section */}
      <Card>
        <CardHeader>
          <CardTitle>Análises e Estatísticas</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="varas" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="varas">Varas</TabsTrigger>
              <TabsTrigger value="nrs">NRs</TabsTrigger>
              <TabsTrigger value="prazos">Prazos</TabsTrigger>
              <TabsTrigger value="recebimentos">Recebimentos</TabsTrigger>
              <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
            </TabsList>
            
            <TabsContent value="varas">
              <NomeacoesPorVaraChart />
            </TabsContent>
            
            <TabsContent value="nrs">
              <AnexosNRChart />
            </TabsContent>
            
            <TabsContent value="prazos">
              <PrazoEntregaChart />
            </TabsContent>
            
            <TabsContent value="recebimentos">
              <RecebimentoPorMesChart />
            </TabsContent>
            
            <TabsContent value="financeiro">
              <RecebidoAReceberChart />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Table */}
      <PericiasTable filters={filters} />
    </div>
  );
};

export default Dashboard;
