import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, ExternalLink, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { FilterState } from "@/pages/Dashboard";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import EditarPericia from "./EditarPericia";
import VisualizarPericia from "./VisualizarPericia";
import { Badge } from "@/components/ui/badge";
import { getStatusColor } from "@/lib/statusColors";

interface PericiasTableProps {
  filters: FilterState;
}

const PericiasTable = ({ filters }: PericiasTableProps) => {
  const [pericias, setPericias] = useState<any[]>([]);
  const [editingPericia, setEditingPericia] = useState<any>(null);
  const [viewingPericia, setViewingPericia] = useState<any>(null);
  const [sortColumn, setSortColumn] = useState<"data_nomeacao" | "data_prazo" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const { toast } = useToast();

  useEffect(() => {
    fetchPericias();
  }, [filters, sortColumn, sortDirection]);

  const fetchPericias = async () => {
    let query = supabase.from("pericias").select("*");

    if (filters.status) query = query.eq("status", filters.status as any);
    if (filters.perito) query = query.eq("perito", filters.perito);
    if (filters.vara) query = query.eq("vara", filters.vara);
    if (filters.dateFrom) query = query.gte("data_nomeacao", filters.dateFrom.toISOString());
    if (filters.dateTo) query = query.lte("data_nomeacao", filters.dateTo.toISOString());

    if (sortColumn) {
      query = query.order(sortColumn, { ascending: sortDirection === "asc" });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data } = await query;
    if (data) setPericias(data);
  };

  const handleSort = (column: "data_nomeacao" | "data_prazo") => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const getSortIcon = (column: "data_nomeacao" | "data_prazo") => {
    if (sortColumn !== column) return <ArrowUpDown className="w-4 h-4 ml-1" />;
    return sortDirection === "asc" ? <ArrowUp className="w-4 h-4 ml-1" /> : <ArrowDown className="w-4 h-4 ml-1" />;
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
                  <TableHead>Nº</TableHead>
                  <TableHead>Nº Vara</TableHead>
                  <TableHead>Reclamante</TableHead>
                  <TableHead>Processo</TableHead>
                  <TableHead>Reclamada</TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort("data_nomeacao")}
                      className="flex items-center hover:text-foreground transition-colors"
                    >
                      Data de Nomeação
                      {getSortIcon("data_nomeacao")}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort("data_prazo")}
                      className="flex items-center hover:text-foreground transition-colors"
                    >
                      Prazo de Entrega
                      {getSortIcon("data_prazo")}
                    </button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pericias.map((pericia) => (
                  <TableRow key={pericia.id}>
                    <TableCell className="font-medium">{pericia.numero || "-"}</TableCell>
                    <TableCell>{pericia.vara}</TableCell>
                    <TableCell>{pericia.requerente}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {pericia.link_processo && (
                          <a
                            href={pericia.link_processo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80"
                            title="Abrir link do processo"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <span>{pericia.numero_processo}</span>
                      </div>
                    </TableCell>
                    <TableCell>{pericia.requerido}</TableCell>
                    <TableCell>{format(new Date(pericia.data_nomeacao), "dd/MM/yyyy")}</TableCell>
                    <TableCell>
                      {pericia.data_prazo ? format(new Date(pericia.data_prazo), "dd/MM/yyyy") : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(pericia.status)}>{pericia.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setViewingPericia(pericia)}
                          title="Visualizar detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setEditingPericia(pericia)}
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(pericia.id)}
                          title="Excluir"
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

      <Dialog open={!!viewingPericia} onOpenChange={() => setViewingPericia(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {viewingPericia && <VisualizarPericia pericia={viewingPericia} />}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingPericia} onOpenChange={() => setEditingPericia(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
