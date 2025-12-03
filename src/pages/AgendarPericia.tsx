import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, Calendar, Mail, Pencil, Trash2, Route } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatDateSafe, parseDateSafe } from "@/lib/utils";
import EditarPericia from "@/components/dashboard/EditarPericia";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";

const AgendarPericia = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pericias, setPericias] = useState<any[]>([]);
  const [editingPericia, setEditingPericia] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>("data_nomeacao");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [schedulingPericia, setSchedulingPericia] = useState<any>(null);
  const [scheduleData, setScheduleData] = useState({ data: undefined as Date | undefined, horario: "" });
  const [selectedPericias, setSelectedPericias] = useState<Set<string>>(new Set());
  const [sendingRoute, setSendingRoute] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchPericias();
  }, [sortField, sortDirection]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
    }
  };

  const fetchPericias = async () => {
    const { data, error } = await supabase
      .from("pericias")
      .select("*")
      .eq("status", "AGENDAR PERÍCIA")
      .order(sortField, { ascending: sortDirection === "asc" });

    if (error) {
      toast({
        title: "Erro ao carregar perícias",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setPericias(data || []);
  };

  const handleUpdateAgenda = async (pericia: any) => {
    // Verifica se tem data e horário
    if (!pericia.data_pericia_agendada || !pericia.horario) {
      setSchedulingPericia(pericia);
      setScheduleData({
        data: parseDateSafe(pericia.data_pericia_agendada),
        horario: pericia.horario || ""
      });
      setScheduleDialogOpen(true);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("google-calendar-sync", {
        body: { pericia },
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Perícia atualizada no Google Agenda",
      });
    } catch (error) {
      console.error("Erro ao atualizar agenda:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar no Google Agenda",
        variant: "destructive",
      });
    }
  };

  const handleConfirmSchedule = async () => {
    if (!scheduleData.data || !scheduleData.horario) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha data e horário para agendar",
        variant: "destructive",
      });
      return;
    }

    try {
      // Atualiza a perícia no banco primeiro
      const { error: updateError } = await supabase
        .from("pericias")
        .update({
          data_pericia_agendada: format(scheduleData.data, "yyyy-MM-dd"),
          horario: scheduleData.horario,
        })
        .eq("id", schedulingPericia.id);

      if (updateError) throw updateError;

      // Prepara os dados para enviar ao Google Agenda
      const periciaAtualizada = {
        ...schedulingPericia,
        data_pericia_agendada: format(scheduleData.data, "yyyy-MM-dd"),
        horario: scheduleData.horario,
      };

      const { error } = await supabase.functions.invoke("google-calendar-sync", {
        body: { pericia: periciaAtualizada },
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Perícia agendada e adicionada ao Google Agenda",
      });

      setScheduleDialogOpen(false);
      setSchedulingPericia(null);
      setScheduleData({ data: undefined, horario: "" });
      fetchPericias();
    } catch (error) {
      console.error("Erro ao agendar:", error);
      toast({
        title: "Erro",
        description: "Não foi possível agendar a perícia",
        variant: "destructive",
      });
    }
  };

  const handleCopyEmails = (pericia: any) => {
    const emails: string[] = [];
    
    if (pericia.email_reclamante) {
      emails.push(...pericia.email_reclamante.split(";").map((e: string) => e.trim()).filter(Boolean));
    }
    
    if (pericia.email_reclamada) {
      emails.push(...pericia.email_reclamada.split(";").map((e: string) => e.trim()).filter(Boolean));
    }

    const emailsString = emails.join("; ");
    
    navigator.clipboard.writeText(emailsString);
    toast({
      title: "Emails copiados",
      description: `${emails.length} email(s) copiado(s) para a área de transferência`,
    });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("pericias")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Perícia excluída",
      description: "A perícia foi excluída com sucesso",
    });
    
    setDeletingId(null);
    fetchPericias();
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const capitalizeWords = (text: string) => {
    if (!text) return text;
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatNRs = (nr15: number[] | null, nr16: number[] | null) => {
    const nrs = [];
    if (nr15 && nr15.length > 0) {
      nrs.push(`NR15: ${nr15.join(", ")}`);
    }
    if (nr16 && nr16.length > 0) {
      nrs.push(`NR16: ${nr16.join(", ")}`);
    }
    return nrs.join(" | ") || "-";
  };

  const handleSelectAll = () => {
    if (selectedPericias.size === pericias.length) {
      setSelectedPericias(new Set());
    } else {
      setSelectedPericias(new Set(pericias.map(p => p.id)));
    }
  };

  const handleSelectPericia = (id: string) => {
    const newSelected = new Set(selectedPericias);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedPericias(newSelected);
  };

  const handleSendRoute = async () => {
    if (selectedPericias.size === 0) {
      toast({
        title: "Nenhuma perícia selecionada",
        description: "Selecione pelo menos uma perícia para traçar a rota.",
        variant: "destructive",
      });
      return;
    }

    setSendingRoute(true);
    
    const selectedData = pericias
      .filter(p => selectedPericias.has(p.id))
      .map(p => ({
        numero: p.numero,
        endereco: p.endereco,
        numero_processo: p.numero_processo,
        requerente: p.requerente,
        data_pericia_agendada: p.data_pericia_agendada,
        horario: p.horario,
      }));

    try {
      const response = await fetch("https://api.uloan.com.br/webhook/rotas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pericias: selectedData }),
      });

      if (!response.ok) {
        throw new Error("Erro ao enviar rotas");
      }

      toast({
        title: "Rotas enviadas com sucesso",
        description: `${selectedData.length} endereço(s) enviado(s) para o webhook.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao enviar rotas",
        description: "Não foi possível enviar os endereços para o webhook.",
        variant: "destructive",
      });
    } finally {
      setSendingRoute(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Perícias - Agendar Perícia ({pericias.length})</CardTitle>
          <Button
            onClick={handleSendRoute}
            disabled={sendingRoute || selectedPericias.size === 0}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Route className="w-4 h-4" />
            Traçar Rota {selectedPericias.size > 0 && `(${selectedPericias.size})`}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={pericias.length > 0 && selectedPericias.size === pericias.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("numero")}>
                    Nº {getSortIcon("numero")}
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("vara")}>
                    Vara {getSortIcon("vara")}
                  </TableHead>
                  <TableHead>Reclamante</TableHead>
                  <TableHead>Processo</TableHead>
                  <TableHead>Reclamada</TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("data_nomeacao")}>
                    Data Nomeação {getSortIcon("data_nomeacao")}
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("data_pericia_agendada")}>
                    Data Perícia {getSortIcon("data_pericia_agendada")}
                  </TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>NRs</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pericias.map((pericia) => (
                  <TableRow key={pericia.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedPericias.has(pericia.id)}
                        onCheckedChange={() => handleSelectPericia(pericia.id)}
                      />
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">{pericia.numero || "-"}</TableCell>
                    <TableCell className="text-xs sm:text-sm">{pericia.vara}</TableCell>
                    <TableCell className="text-xs sm:text-sm max-w-[120px] truncate">{capitalizeWords(pericia.requerente)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm">{pericia.numero_processo}</span>
                        {pericia.link_processo && (
                          <a 
                            href={pericia.link_processo} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80"
                          >
                            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm max-w-[120px] truncate">{capitalizeWords(pericia.requerido)}</TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {formatDateSafe(pericia.data_nomeacao)}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                      {formatDateSafe(pericia.data_pericia_agendada)}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">{pericia.horario || "-"}</TableCell>
                    <TableCell className="text-xs sm:text-sm max-w-[150px] truncate">{capitalizeWords(pericia.endereco || "-")}</TableCell>
                    <TableCell className="text-xs sm:text-sm">{formatNRs(pericia.nr15, pericia.nr16)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateAgenda(pericia)}
                          title="Atualizar na Agenda"
                          className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                        >
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyEmails(pericia)}
                          title="Copiar Emails"
                          className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                        >
                          <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingPericia(pericia)}
                          className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                        >
                          <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeletingId(pericia.id)}
                          className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {pericias.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center text-muted-foreground">
                      Nenhuma perícia com status "Agendar Perícia"
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para agendar data e horário */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendar Perícia</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Data da Perícia *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduleData.data ? format(scheduleData.data, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={scheduleData.data}
                    onSelect={(date) => setScheduleData({ ...scheduleData, data: date })}
                    locale={ptBR}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Horário *</Label>
              <Input
                type="time"
                value={scheduleData.horario}
                onChange={(e) => setScheduleData({ ...scheduleData, horario: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmSchedule}>
              Agendar e Adicionar ao Google Agenda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar */}
      <Dialog open={!!editingPericia} onOpenChange={(open) => !open && setEditingPericia(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {editingPericia && (
            <EditarPericia 
              pericia={editingPericia} 
              onSuccess={() => {
                setEditingPericia(null);
                fetchPericias();
              }} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Alert para confirmar exclusão */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta perícia? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingId && handleDelete(deletingId)}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AgendarPericia;
