import { useEffect, useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Scale } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import DeadlineAlertPopup from "@/components/dashboard/DeadlineAlertPopup";
import { AIChat } from "@/components/AIChat";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [showDeadlineAlert, setShowDeadlineAlert] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    // Show popup only when landing on /dashboard (main page)
    if (location.pathname === "/dashboard") {
      const hasSeenAlert = sessionStorage.getItem("deadline_alert_seen");
      if (!hasSeenAlert) {
        setShowDeadlineAlert(true);
        sessionStorage.setItem("deadline_alert_seen", "true");
      }
    }
  }, [location.pathname]);

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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-muted/20 to-background overflow-x-hidden">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <SidebarTrigger className="shrink-0" />
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
                  <Scale className="w-4 h-4 sm:w-6 sm:h-6 text-primary-foreground" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-xl font-bold text-foreground truncate">Dashboard de Perícias</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Sistema de Gestão Judicial</p>
                </div>
              </div>
              <Button onClick={handleLogout} variant="outline" size="sm" className="shrink-0">
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 flex-1 overflow-x-auto">
            <Outlet />
          </main>
        </div>
      </div>
      <DeadlineAlertPopup
        open={showDeadlineAlert}
        onOpenChange={setShowDeadlineAlert}
      />
      <AIChat />
    </SidebarProvider>
  );
};

export default DashboardLayout;
