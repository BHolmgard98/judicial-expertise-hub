import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { formatDateSafe, formatCurrency } from "@/lib/utils";
import { ChevronUp, ChevronDown, ChevronsUpDown, ExternalLink, Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import EditarPericia from "@/components/dashboard/EditarPericia";
import VisualizarPericia from "@/components/dashboard/VisualizarPericia";

interface StatusPageProps {
  status: string;
  title: string;
}

type SortDirection = "asc" | "desc" | null;
type SortField = string;

const StatusPage = ({ status, title }: StatusPageProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pericias, setPericias] = useState<any[]>([]);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [editingPericia, setEditingPericia] = useState<any | null>(null);
  const [viewingPericia, setViewingPericia] = useState<any | null>(null);

  useEffect(() => {
    checkAuth();
    fetchPericias();
  }, [status]);

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
      .eq("status", status as any)
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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection("asc");
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ChevronsUpDown className="w-4 h-4" />;
    if (sortDirection === "asc") return <ChevronUp className="w-4 h-4" />;
    if (sortDirection === "desc") return <ChevronDown className="w-4 h-4" />;
    return <ChevronsUpDown className="w-4 h-4" />;
  };

  const sortedPericias = [...pericias].sort((a, b) => {
    if (!sortField || !sortDirection) return 0;

    let aVal = a[sortField];
    let bVal = b[sortField];

    // Handle nulls
    if (aVal === null || aVal === undefined) return sortDirection === "asc" ? 1 : -1;
    if (bVal === null || bVal === undefined) return sortDirection === "asc" ? -1 : 1;

    // Handle numbers
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    }

    // Handle dates
    if (sortField.includes("data") || sortField.includes("prazo")) {
      const dateA = new Date(aVal).getTime();
      const dateB = new Date(bVal).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    }

    // Handle strings
    const strA = String(aVal).toLowerCase();
    const strB = String(bVal).toLowerCase();
    return sortDirection === "asc" ? strA.localeCompare(strB) : strB.localeCompare(strA);
  });

  const formatNRs = (nr15: number[] | null, nr16: number[] | null) => {
    const parts: string[] = [];
    if (nr15 && nr15.length > 0) {
      parts.push(`NR15: ${nr15.join(", ")}`);
    }
    if (nr16 && nr16.length > 0) {
      parts.push(`NR16: ${nr16.join(", ")}`);
    }
    return parts.join(" | ") || "-";
  };

  const renderProcessoLink = (pericia: any) => {
    if (pericia.link_processo) {
      return (
        <a
          href={pericia.link_processo}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-primary hover:underline"
        >
          {pericia.numero_processo}
          <ExternalLink className="w-3 h-3" />
        </a>
      );
    }
    return pericia.numero_processo;
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead
      className="cursor-pointer hover:bg-muted/50 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {getSortIcon(field)}
      </div>
    </TableHead>
  );

  const renderTableContent = () => {
    switch (status) {
      case "AGUARDANDO PERÍCIA":
        return (
          <>
            <TableHeader>
              <TableRow>
                <SortableHeader field="numero">Nº</SortableHeader>
                <SortableHeader field="vara">Vara</SortableHeader>
                <SortableHeader field="requerente">Reclamante</SortableHeader>
                <SortableHeader field="numero_processo">Processo</SortableHeader>
                <SortableHeader field="requerido">Reclamada</SortableHeader>
                <SortableHeader field="data_pericia_agendada">Data Perícia</SortableHeader>
                <SortableHeader field="horario">Horário</SortableHeader>
                <TableHead>Endereço</TableHead>
                <TableHead>NRs</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPericias.map((pericia) => (
                <TableRow key={pericia.id}>
                  <TableCell>{pericia.numero || "-"}</TableCell>
                  <TableCell>{pericia.vara}</TableCell>
                  <TableCell>{pericia.requerente}</TableCell>
                  <TableCell>{renderProcessoLink(pericia)}</TableCell>
                  <TableCell>{pericia.requerido}</TableCell>
                  <TableCell>{formatDateSafe(pericia.data_pericia_agendada)}</TableCell>
                  <TableCell>{pericia.horario || "-"}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={pericia.endereco || ""}>
                    {pericia.endereco || "-"}
                  </TableCell>
                  <TableCell>{formatNRs(pericia.nr15, pericia.nr16)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setViewingPericia(pericia)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setEditingPericia(pericia)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </>
        );

      case "AGUARDANDO LAUDO":
        return (
          <>
            <TableHeader>
              <TableRow>
                <SortableHeader field="numero">Nº</SortableHeader>
                <SortableHeader field="vara">Vara</SortableHeader>
                <SortableHeader field="requerente">Reclamante</SortableHeader>
                <SortableHeader field="numero_processo">Processo</SortableHeader>
                <SortableHeader field="requerido">Reclamada</SortableHeader>
                <SortableHeader field="data_prazo">Prazo Entrega</SortableHeader>
                <SortableHeader field="data_entrega">Data Entrega</SortableHeader>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPericias.map((pericia) => (
                <TableRow key={pericia.id}>
                  <TableCell>{pericia.numero || "-"}</TableCell>
                  <TableCell>{pericia.vara}</TableCell>
                  <TableCell>{pericia.requerente}</TableCell>
                  <TableCell>{renderProcessoLink(pericia)}</TableCell>
                  <TableCell>{pericia.requerido}</TableCell>
                  <TableCell>{formatDateSafe(pericia.data_prazo)}</TableCell>
                  <TableCell>{formatDateSafe(pericia.data_entrega)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setViewingPericia(pericia)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setEditingPericia(pericia)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </>
        );

      case "AGUARDANDO ESCLARECIMENTOS":
        return (
          <>
            <TableHeader>
              <TableRow>
                <SortableHeader field="numero">Nº</SortableHeader>
                <SortableHeader field="vara">Vara</SortableHeader>
                <SortableHeader field="requerente">Reclamante</SortableHeader>
                <SortableHeader field="numero_processo">Processo</SortableHeader>
                <SortableHeader field="requerido">Reclamada</SortableHeader>
                <SortableHeader field="prazo_esclarecimento">Prazo Esclarecimentos</SortableHeader>
                <SortableHeader field="data_esclarecimento">Data Entrega</SortableHeader>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPericias.map((pericia) => (
                <TableRow key={pericia.id}>
                  <TableCell>{pericia.numero || "-"}</TableCell>
                  <TableCell>{pericia.vara}</TableCell>
                  <TableCell>{pericia.requerente}</TableCell>
                  <TableCell>{renderProcessoLink(pericia)}</TableCell>
                  <TableCell>{pericia.requerido}</TableCell>
                  <TableCell>{formatDateSafe(pericia.prazo_esclarecimento)}</TableCell>
                  <TableCell>{formatDateSafe(pericia.data_esclarecimento)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setViewingPericia(pericia)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setEditingPericia(pericia)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </>
        );

      case "HONORÁRIOS RECEBIDOS":
        return (
          <>
            <TableHeader>
              <TableRow>
                <SortableHeader field="numero">Nº</SortableHeader>
                <SortableHeader field="vara">Vara</SortableHeader>
                <SortableHeader field="requerente">Reclamante</SortableHeader>
                <SortableHeader field="numero_processo">Processo</SortableHeader>
                <SortableHeader field="requerido">Reclamada</SortableHeader>
                <SortableHeader field="data_nomeacao">Data Nomeação</SortableHeader>
                <SortableHeader field="honorarios">Valor Sentença</SortableHeader>
                <SortableHeader field="valor_recebimento">Valor Recebido</SortableHeader>
                <SortableHeader field="data_recebimento">Data Recebimento</SortableHeader>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPericias.map((pericia) => (
                <TableRow key={pericia.id}>
                  <TableCell>{pericia.numero || "-"}</TableCell>
                  <TableCell>{pericia.vara}</TableCell>
                  <TableCell>{pericia.requerente}</TableCell>
                  <TableCell>{renderProcessoLink(pericia)}</TableCell>
                  <TableCell>{pericia.requerido}</TableCell>
                  <TableCell>{formatDateSafe(pericia.data_nomeacao)}</TableCell>
                  <TableCell>{pericia.honorarios ? formatCurrency(pericia.honorarios) : "-"}</TableCell>
                  <TableCell>{pericia.valor_recebimento ? formatCurrency(pericia.valor_recebimento) : "-"}</TableCell>
                  <TableCell>{formatDateSafe(pericia.data_recebimento)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setViewingPericia(pericia)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setEditingPericia(pericia)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </>
        );

      default:
        return (
          <>
            <TableHeader>
              <TableRow>
                <SortableHeader field="numero">Nº</SortableHeader>
                <SortableHeader field="vara">Vara</SortableHeader>
                <SortableHeader field="requerente">Reclamante</SortableHeader>
                <SortableHeader field="numero_processo">Processo</SortableHeader>
                <SortableHeader field="requerido">Reclamada</SortableHeader>
                <SortableHeader field="data_nomeacao">Data Nomeação</SortableHeader>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPericias.map((pericia) => (
                <TableRow key={pericia.id}>
                  <TableCell>{pericia.numero || "-"}</TableCell>
                  <TableCell>{pericia.vara}</TableCell>
                  <TableCell>{pericia.requerente}</TableCell>
                  <TableCell>{renderProcessoLink(pericia)}</TableCell>
                  <TableCell>{pericia.requerido}</TableCell>
                  <TableCell>{formatDateSafe(pericia.data_nomeacao)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setViewingPericia(pericia)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setEditingPericia(pericia)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Perícias - {title} ({pericias.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              {renderTableContent()}
              {sortedPericias.length === 0 && (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground">
                      Nenhuma perícia com status "{title}"
                    </TableCell>
                  </TableRow>
                </TableBody>
              )}
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para visualizar */}
      <Dialog open={!!viewingPericia} onOpenChange={() => setViewingPericia(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <VisualizarPericia pericia={viewingPericia} />
        </DialogContent>
      </Dialog>

      {/* Dialog para editar */}
      <Dialog open={!!editingPericia} onOpenChange={() => setEditingPericia(null)}>
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
    </div>
  );
};

export default StatusPage;
