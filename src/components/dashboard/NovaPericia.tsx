import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface NovaPericiaProps {
  onSuccess: () => void;
}

const NovaPericia = ({ onSuccess }: NovaPericiaProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    numero_processo: "",
    requerente: "",
    requerido: "",
    vara: "",
    perito: "",
    status: "Aguardando",
    data_nomeacao: new Date(),
    data_prazo: undefined as Date | undefined,
    honorarios: "",
    observacoes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase.from("pericias").insert({
        numero_processo: formData.numero_processo,
        requerente: formData.requerente,
        requerido: formData.requerido,
        vara: formData.vara,
        perito: formData.perito,
        status: formData.status,
        data_nomeacao: formData.data_nomeacao.toISOString().split('T')[0],
        data_prazo: formData.data_prazo?.toISOString().split('T')[0] || null,
        honorarios: formData.honorarios ? parseFloat(formData.honorarios) : null,
        observacoes: formData.observacoes,
        user_id: user.id,
      } as any);

      if (error) throw error;

      toast({
        title: "Perícia cadastrada",
        description: "A perícia foi adicionada com sucesso",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold">Nova Perícia</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="numero_processo">Número do Processo *</Label>
          <Input
            id="numero_processo"
            value={formData.numero_processo}
            onChange={(e) => setFormData({ ...formData, numero_processo: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vara">Vara *</Label>
          <Input
            id="vara"
            value={formData.vara}
            onChange={(e) => setFormData({ ...formData, vara: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="requerente">Requerente *</Label>
          <Input
            id="requerente"
            value={formData.requerente}
            onChange={(e) => setFormData({ ...formData, requerente: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="requerido">Requerido *</Label>
          <Input
            id="requerido"
            value={formData.requerido}
            onChange={(e) => setFormData({ ...formData, requerido: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="perito">Perito *</Label>
          <Input
            id="perito"
            value={formData.perito}
            onChange={(e) => setFormData({ ...formData, perito: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Aguardando">Aguardando</SelectItem>
              <SelectItem value="Em andamento">Em andamento</SelectItem>
              <SelectItem value="Suspensa">Suspensa</SelectItem>
              <SelectItem value="Concluída">Concluída</SelectItem>
              <SelectItem value="Arquivada">Arquivada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Data de Nomeação *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(formData.data_nomeacao, "PP", { locale: ptBR })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.data_nomeacao}
                onSelect={(date) => date && setFormData({ ...formData, data_nomeacao: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Data do Prazo</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.data_prazo ? format(formData.data_prazo, "PP", { locale: ptBR }) : "Selecionar"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.data_prazo}
                onSelect={(date) => setFormData({ ...formData, data_prazo: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="honorarios">Honorários (R$)</Label>
          <Input
            id="honorarios"
            type="number"
            step="0.01"
            value={formData.honorarios}
            onChange={(e) => setFormData({ ...formData, honorarios: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          value={formData.observacoes}
          onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
          rows={4}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Cadastrando..." : "Adicionar Perícia"}
      </Button>
    </form>
  );
};

export default NovaPericia;
