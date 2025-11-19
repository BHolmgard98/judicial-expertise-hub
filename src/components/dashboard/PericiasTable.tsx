import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, ExternalLink, ArrowUpDown, ArrowUp, ArrowDown, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { FilterState } from "@/pages/Dashboard";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import EditarPericia from "./EditarPericia";
import VisualizarPericia from "./VisualizarPericia";
import { Badge } from "@/components/ui/badge";
import { getStatusColor } from "@/lib/statusColors";
import { formatDateSafe } from "@/lib/utils";

interface PericiasTableProps {
  filters: FilterState;
}

const PericiasTable = ({ filters }: PericiasTableProps) => {
  const [pericias, setPericias] = useState<any[]>([]);
  const [editingPericia, setEditingPericia] = useState<any>(null);
  const [viewingPericia, setViewingPericia] = useState<any>(null);
  const [sortColumn, setSortColumn] = useState<"numero" | "vara" | "data_nomeacao" | "data_prazo" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedPericias, setSelectedPericias] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const { toast } = useToast();

  useEffect(() => {
    fetchPericias();
    setCurrentPage(1); // Reset para página 1 ao mudar filtros
  }, [filters, sortColumn, sortDirection]);

  const fetchPericias = async () => {
    let query = supabase.from("pericias").select("*");

    if (filters.status) query = query.eq("status", filters.status as any);
    if (filters.vara) query = query.eq("vara", filters.vara);
    if (filters.requerente) query = query.ilike("requerente", `%${filters.requerente}%`);
    if (filters.nr15.length > 0) query = query.overlaps("nr15", filters.nr15);
    if (filters.nr16.length > 0) query = query.overlaps("nr16", filters.nr16);
    
    // Filtros dinâmicos baseados no status
    if (filters.dataNomeacao) query = query.eq("data_nomeacao", filters.dataNomeacao);
    if (filters.dataAgendada) query = query.eq("data_pericia_agendada", filters.dataAgendada);
    if (filters.horario) query = query.eq("horario", filters.horario);
    if (filters.dataEntrega) query = query.eq("data_entrega", filters.dataEntrega);
    if (filters.prazoEsclarecimento) query = query.eq("prazo_esclarecimento", filters.prazoEsclarecimento);
    
    // Filtro por mês/ano de nomeação
    if (filters.ano && filters.mes) {
      const year = parseInt(filters.ano);
      const month = parseInt(filters.mes);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      query = query
        .gte("data_nomeacao", startDate.toISOString().split('T')[0])
        .lte("data_nomeacao", endDate.toISOString().split('T')[0]);
    } else if (filters.ano) {
      const year = parseInt(filters.ano);
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      
      query = query
        .gte("data_nomeacao", startDate.toISOString().split('T')[0])
        .lte("data_nomeacao", endDate.toISOString().split('T')[0]);
    }

    if (sortColumn) {
      query = query.order(sortColumn, { ascending: sortDirection === "asc" });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data } = await query;
    if (data) setPericias(data);
  };

  const handleSort = (column: "numero" | "vara" | "data_nomeacao" | "data_prazo") => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const getSortIcon = (column: "numero" | "vara" | "data_nomeacao" | "data_prazo") => {
    if (sortColumn !== column) return <ArrowUpDown className="w-4 h-4 ml-1" />;
    return sortDirection === "asc" ? <ArrowUp className="w-4 h-4 ml-1" /> : <ArrowDown className="w-4 h-4 ml-1" />;
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPericias(new Set(pericias.map(p => p.id)));
    } else {
      setSelectedPericias(new Set());
    }
  };

  const handleSelectPericia = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedPericias);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedPericias(newSelected);
  };

  const handleCopyRoute = async () => {
    const selectedPericiasData = pericias.filter(p => selectedPericias.has(p.id));
    const enderecos = selectedPericiasData
      .filter(p => p.endereco && p.endereco.trim() !== "")
      .map(p => p.endereco);

    if (enderecos.length === 0) {
      toast({
        title: "Nenhum endereço encontrado",
        description: "As perícias selecionadas não possuem endereços cadastrados",
        variant: "destructive",
      });
      return;
    }

    const rotaText = enderecos.join(" / ");
    
    try {
      await navigator.clipboard.writeText(rotaText);
      toast({
        title: "Rota copiada!",
        description: `${enderecos.length} endereço(s) copiado(s) para a área de transferência`,
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar os endereços",
        variant: "destructive",
      });
    }
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

  // Cálculos de paginação
  const totalPages = Math.ceil(pericias.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPericias = pericias.slice(startIndex, endIndex);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Perícias Registradas ({pericias.length})</CardTitle>
          <div className="flex gap-2 items-center">
            {selectedPericias.size > 1 && (
              <Button onClick={handleCopyRoute} variant="outline">
                <MapPin className="w-4 h-4 mr-2" />
                Copiar Rota ({selectedPericias.size})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedPericias.size === currentPericias.length && currentPericias.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort("numero")}
                      className="flex items-center hover:text-foreground transition-colors"
                    >
                      Nº
                      {getSortIcon("numero")}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort("vara")}
                      className="flex items-center hover:text-foreground transition-colors"
                    >
                      Nº Vara
                      {getSortIcon("vara")}
                    </button>
                  </TableHead>
                  <TableHead>Reclamante</TableHead>
                  <TableHead>Processo</TableHead>
                  <TableHead>Reclamada</TableHead>
                  
                  {/* Colunas dinâmicas baseadas no status filtrado */}
                  {filters.status === "AGENDAR PERÍCIA" && (
                    <TableHead>
                      <button
                        onClick={() => handleSort("data_nomeacao")}
                        className="flex items-center hover:text-foreground transition-colors"
                      >
                        Data de Nomeação
                        {getSortIcon("data_nomeacao")}
                      </button>
                    </TableHead>
                  )}
                  
                  {filters.status === "AGUARDANDO PERÍCIA" && (
                    <>
                      <TableHead>Data Perícia Agendada</TableHead>
                      <TableHead>Horário</TableHead>
                    </>
                  )}
                  
                  {filters.status === "AGUARDANDO LAUDO" && (
                    <TableHead>Data de Entrega</TableHead>
                  )}
                  
                  {filters.status === "AGUARDANDO ESCLARECIMENTOS" && (
                    <TableHead>Prazo de Esclarecimento</TableHead>
                  )}
                  
                  {/* Colunas padrão quando não há filtro específico ou para outros status */}
                  {(!filters.status || !["AGENDAR PERÍCIA", "AGUARDANDO PERÍCIA", "AGUARDANDO LAUDO", "AGUARDANDO ESCLARECIMENTOS"].includes(filters.status)) && (
                    <>
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
                    </>
                  )}
                  
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentPericias.map((pericia) => (
                  <TableRow key={pericia.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedPericias.has(pericia.id)}
                        onCheckedChange={(checked) => handleSelectPericia(pericia.id, checked as boolean)}
                      />
                    </TableCell>
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
                    
                    {/* Células dinâmicas baseadas no status filtrado */}
                    {filters.status === "AGENDAR PERÍCIA" && (
                      <TableCell>{formatDateSafe(pericia.data_nomeacao)}</TableCell>
                    )}
                    
                    {filters.status === "AGUARDANDO PERÍCIA" && (
                      <>
                        <TableCell>
                          {formatDateSafe(pericia.data_pericia_agendada)}
                        </TableCell>
                        <TableCell>{pericia.horario || "-"}</TableCell>
                      </>
                    )}
                    
                    {filters.status === "AGUARDANDO LAUDO" && (
                      <TableCell>
                        {formatDateSafe(pericia.data_entrega)}
                      </TableCell>
                    )}
                    
                    {filters.status === "AGUARDANDO ESCLARECIMENTOS" && (
                      <TableCell>
                        {formatDateSafe(pericia.prazo_esclarecimento)}
                      </TableCell>
                    )}
                    
                    {/* Células padrão quando não há filtro específico ou para outros status */}
                    {(!filters.status || !["AGENDAR PERÍCIA", "AGUARDANDO PERÍCIA", "AGUARDANDO LAUDO", "AGUARDANDO ESCLARECIMENTOS"].includes(filters.status)) && (
                      <>
                        <TableCell>{formatDateSafe(pericia.data_nomeacao)}</TableCell>
                        <TableCell>
                          {formatDateSafe(pericia.data_prazo)}
                        </TableCell>
                      </>
                    )}
                    
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
          
          {/* Paginação */}
          {pericias.length > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Itens por página:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border rounded px-2 py-1 text-sm bg-background"
                >
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-muted-foreground">
                  {startIndex + 1}-{Math.min(endIndex, pericias.length)} de {pericias.length}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNumber)}
                        className="w-8"
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Próximo
                </Button>
              </div>
            </div>
          )}
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
