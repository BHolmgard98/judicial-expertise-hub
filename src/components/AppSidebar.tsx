import { Calendar, CalendarCheck, Clock, FileText, Gavel, CheckCircle, Archive, Home, Settings } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

const statusItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Agendar Perícia", url: "/dashboard/agendar-pericia", icon: CalendarCheck, status: "AGENDAR PERÍCIA", showCount: true },
  { title: "Aguardando Perícia", url: "/dashboard/aguardando-pericia", icon: Clock, status: "AGUARDANDO PERÍCIA", showCount: true },
  { title: "Aguardando Laudo", url: "/dashboard/aguardando-laudo", icon: FileText, status: "AGUARDANDO LAUDO", showCount: true },
  { title: "Aguardando Esclarecimentos", url: "/dashboard/aguardando-esclarecimentos", icon: FileText, status: "AGUARDANDO ESCLARECIMENTOS", showCount: true },
  { title: "Laudo/Esclarecimentos Entregues", url: "/dashboard/laudo-entregue", icon: CheckCircle, status: "LAUDO/ESCLARECIMENTOS ENTREGUES", showCount: true },
  { title: "Sentença", url: "/dashboard/sentenca", icon: Gavel, status: "SENTENÇA", showCount: true },
  { title: "Recurso Ordinário", url: "/dashboard/recurso-ordinario", icon: FileText, status: "RECURSO ORDINÁRIO", showCount: true },
  { title: "Honorários Recebidos", url: "/dashboard/honorarios-recebidos", icon: CheckCircle, status: "HONORÁRIOS RECEBIDOS", showCount: true },
  { title: "Configurações", url: "/dashboard/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const [counts, setCounts] = useState<Record<string, number>>({});

  const isActive = (path: string) => currentPath === path;

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    const { data, error } = await supabase
      .from("pericias")
      .select("status");

    if (error || !data) return;

    const countMap: Record<string, number> = {};
    data.forEach((pericia) => {
      if (pericia.status) {
        countMap[pericia.status] = (countMap[pericia.status] || 0) + 1;
      }
    });
    setCounts(countMap);
  };

  return (
    <Sidebar
      className={open ? "w-64" : "w-14"}
      collapsible="icon"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {statusItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className="hover:bg-muted/50" 
                      activeClassName="bg-muted text-primary font-medium"
                    >
                      <item.icon className="w-4 h-4" />
                      {open && (
                        <span className="ml-2 flex items-center gap-2">
                          {item.title}
                          {item.showCount && item.status && counts[item.status] !== undefined && (
                            <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                              {counts[item.status]}
                            </span>
                          )}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
