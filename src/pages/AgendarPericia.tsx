import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, Calendar, Mail, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import EditarPericia from "@/components/dashboard/EditarPericia";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const AgendarPericia = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pericias, setPericias] = useState<any[]>([]);
  const [editingPericia, setEditingPericia] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    fetchPericias();
  }, []);

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
      .order("data_nomeacao", { ascending: false });

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Perícias - Agendar Perícia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº</TableHead>
                  <TableHead>Vara</TableHead>
                  <TableHead>Reclamante</TableHead>
                  <TableHead>Processo</TableHead>
                  <TableHead>Reclamada</TableHead>
                  <TableHead>Data Nomeação</TableHead>
                  <TableHead>Data Perícia</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>NRs</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pericias.map((pericia) => (
                  <TableRow key={pericia.id}>
                    <TableCell>{pericia.numero || "-"}</TableCell>
                    <TableCell>{pericia.vara}</TableCell>
                    <TableCell>{pericia.requerente}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{pericia.numero_processo}</span>
                        {pericia.link_processo && (
                          <a 
                            href={pericia.link_processo} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{pericia.requerido}</TableCell>
                    <TableCell>
                      {pericia.data_nomeacao ? new Date(pericia.data_nomeacao).toLocaleDateString("pt-BR") : "-"}
                    </TableCell>
                    <TableCell>
                      {pericia.data_pericia_agendada ? new Date(pericia.data_pericia_agendada).toLocaleDateString("pt-BR") : "-"}
                    </TableCell>
                    <TableCell>{pericia.horario || "-"}</TableCell>
                    <TableCell className="max-w-xs truncate">{pericia.endereco || "-"}</TableCell>
                    <TableCell className="text-sm">{formatNRs(pericia.nr15, pericia.nr16)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateAgenda(pericia)}
                          title="Atualizar na Agenda"
                        >
                          <Calendar className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyEmails(pericia)}
                          title="Copiar Emails"
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingPericia(pericia)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeletingId(pericia.id)}
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Dialog para editar */}
      <Dialog open={!!editingPericia} onOpenChange={(open) => !open && setEditingPericia(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <EditarPericia 
            pericia={editingPericia} 
            onSuccess={() => {
              setEditingPericia(null);
              fetchPericias();
            }} 
          />
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
