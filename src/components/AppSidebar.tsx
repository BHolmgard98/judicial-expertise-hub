import { Calendar, CalendarCheck, Clock, FileText, Gavel, CheckCircle, Archive, Home } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
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
  { title: "Agendar Perícia", url: "/dashboard/agendar-pericia", icon: CalendarCheck, status: "AGENDAR PERÍCIA" },
  { title: "Aguardando Perícia", url: "/dashboard/aguardando-pericia", icon: Clock, status: "AGUARDANDO PERÍCIA" },
  { title: "Aguardando Laudo", url: "/dashboard/aguardando-laudo", icon: FileText, status: "AGUARDANDO LAUDO" },
  { title: "Aguardando Esclarecimentos", url: "/dashboard/aguardando-esclarecimentos", icon: FileText, status: "AGUARDANDO ESCLARECIMENTOS" },
  { title: "Laudo/Esclarecimentos Entregues", url: "/dashboard/laudo-entregue", icon: CheckCircle, status: "LAUDO/ESCLARECIMENTOS ENTREGUES" },
  { title: "Sentença", url: "/dashboard/sentenca", icon: Gavel, status: "SENTENÇA" },
  { title: "Recurso Ordinário", url: "/dashboard/recurso-ordinario", icon: FileText, status: "RECURSO ORDINÁRIO" },
  { title: "Honorários Recebidos", url: "/dashboard/honorarios-recebidos", icon: CheckCircle, status: "HONORÁRIOS RECEBIDOS" },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

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
                      {open && <span className="ml-2">{item.title}</span>}
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
