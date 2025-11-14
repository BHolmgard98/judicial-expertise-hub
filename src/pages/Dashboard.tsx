import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Plus, Scale } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DashboardFilters from "@/components/dashboard/DashboardFilters";
import StatusChart from "@/components/dashboard/StatusChart";
import PrazosChart from "@/components/dashboard/PrazosChart";
import PericiasTable from "@/components/dashboard/PericiasTable";
import NovaPericia from "@/components/dashboard/NovaPericia";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export interface FilterState {
  status: string;
  perito: string;
  vara: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filters, setFilters] = useState<FilterState>({
    status: "",
    perito: "",
    vara: "",
    dateFrom: undefined,
    dateTo: undefined,
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
                  <NovaPericia onSuccess={() => setOpen(false)} />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <DashboardFilters filters={filters} setFilters={setFilters} />
            </CardContent>
          </Card>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <StatusChart filters={filters} />
            <PrazosChart filters={filters} />
          </div>

          {/* Table */}
          <PericiasTable filters={filters} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
