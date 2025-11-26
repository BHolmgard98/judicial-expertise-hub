import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./pages/DashboardLayout";
import AgendarPericia from "./pages/AgendarPericia";
import StatusPage from "./pages/StatusPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="agendar-pericia" element={<AgendarPericia />} />
            <Route path="aguardando-pericia" element={<StatusPage status="AGUARDANDO PERÍCIA" title="Aguardando Perícia" />} />
            <Route path="aguardando-laudo" element={<StatusPage status="AGUARDANDO LAUDO" title="Aguardando Laudo" />} />
            <Route path="aguardando-esclarecimentos" element={<StatusPage status="AGUARDANDO ESCLARECIMENTOS" title="Aguardando Esclarecimentos" />} />
            <Route path="laudo-entregue" element={<StatusPage status="LAUDO/ESCLARECIMENTOS ENTREGUES" title="Laudo/Esclarecimentos Entregues" />} />
            <Route path="sentenca" element={<StatusPage status="SENTENÇA" title="Sentença" />} />
            <Route path="recurso-ordinario" element={<StatusPage status="RECURSO ORDINÁRIO" title="Recurso Ordinário" />} />
            <Route path="honorarios-recebidos" element={<StatusPage status="HONORÁRIOS RECEBIDOS" title="Honorários Recebidos" />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
