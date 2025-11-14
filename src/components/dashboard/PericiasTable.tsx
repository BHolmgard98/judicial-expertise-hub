import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { FilterState } from "@/pages/Dashboard";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import EditarPericia from "./EditarPericia";
import { Badge } from "@/components/ui/badge";

interface PericiasTableProps {
  filters: FilterState;
}

const PericiasTable = ({ filters }: PericiasTableProps) => {
  const [pericias, setPericias] = useState<any[]>([]);
  const [editingPericia, setEditingPericia] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPericias();
  }, [filters]);

  const fetchPericias = async () => {
    let query = supabase.from("pericias").select("*").order("created_at", { ascending: false });

    if (filters.status) query = query.eq("status", filters.status as any);
    if (filters.perito) query = query.eq("perito", filters.perito);
    if (filters.vara) query = query.eq("vara", filters.vara);
    if (filters.dateFrom) query = query.gte("data_nomeacao", filters.dateFrom.toISOString());
    if (filters.dateTo) query = query.lte("data_nomeacao", filters.dateTo.toISOString());

    const { data } = await query;
    if (data) setPericias(data);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta perícia?")) return;

    const { error } = await supabase.from("pericias").delete().eq("id", id);

    if (error) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Perícia excluída",
        description: "A perícia foi removida com sucesso",
      });
      fetchPericias();
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Concluída":
        return "default";
      case "Em andamento":
        return "secondary";
      case "Aguardando":
        return "outline";
      case "Suspensa":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Perícias Registradas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Processo</TableHead>
                  <TableHead>Requerente</TableHead>
                  <TableHead>Requerido</TableHead>
                  <TableHead>Vara</TableHead>
                  <TableHead>Perito</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Nomeação</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>Entrega</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pericias.map((pericia) => (
                  <TableRow key={pericia.id}>
                    <TableCell className="font-medium">{pericia.numero_processo}</TableCell>
                    <TableCell>{pericia.requerente}</TableCell>
                    <TableCell>{pericia.requerido}</TableCell>
                    <TableCell>{pericia.vara}</TableCell>
                    <TableCell>{pericia.perito}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(pericia.status)}>{pericia.status}</Badge>
                    </TableCell>
                    <TableCell>{format(new Date(pericia.data_nomeacao), "dd/MM/yyyy")}</TableCell>
                    <TableCell>
                      {pericia.data_prazo ? format(new Date(pericia.data_prazo), "dd/MM/yyyy") : "-"}
                    </TableCell>
                    <TableCell>
                      {pericia.data_entrega ? format(new Date(pericia.data_entrega), "dd/MM/yyyy") : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setEditingPericia(pericia)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(pericia.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editingPericia} onOpenChange={() => setEditingPericia(null)}>
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
    </>
  );
};

export default PericiasTable;
