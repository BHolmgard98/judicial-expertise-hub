import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface StatusPageProps {
  status: string;
  title: string;
}

const StatusPage = ({ status, title }: StatusPageProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pericias, setPericias] = useState<any[]>([]);

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Perícias - {title}</CardTitle>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {pericias.map((pericia) => (
                  <TableRow key={pericia.id}>
                    <TableCell>{pericia.numero || "-"}</TableCell>
                    <TableCell>{pericia.vara}</TableCell>
                    <TableCell>{pericia.requerente}</TableCell>
                    <TableCell>{pericia.numero_processo}</TableCell>
                    <TableCell>{pericia.requerido}</TableCell>
                    <TableCell>
                      {pericia.data_nomeacao ? new Date(pericia.data_nomeacao).toLocaleDateString("pt-BR") : "-"}
                    </TableCell>
                  </TableRow>
                ))}
                {pericias.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Nenhuma perícia com status "{title}"
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatusPage;
