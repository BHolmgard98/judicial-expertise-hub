import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Plus, Scale } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
  const navigate = useNavigate();
  const { toast } = useToast();
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

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logout realizado",
      description: "Até breve!",
    });
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Scale className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Dashboard de Perícias</h1>
              <p className="text-sm text-muted-foreground">Sistema de Gestão Judicial</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Import Section */}
          <ImportarPericias />

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
                    // Aplicar filtros dos anexos da nova perícia
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
      </main>
    </div>
  );
};

export default Dashboard;
