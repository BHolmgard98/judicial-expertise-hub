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
import { STATUS_OPTIONS } from "@/lib/statusColors";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface NovaPericiaProps {
  onSuccess: () => void;
}

const NovaPericia = ({ onSuccess }: NovaPericiaProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [nr15Selected, setNr15Selected] = useState<number[]>([]);
  const [nr16Selected, setNr16Selected] = useState<number[]>([]);
  
  const [formData, setFormData] = useState({
    numero_processo: "",
    link_processo: "",
    cidade: "",
    vara: "",
    requerente: "",
    funcao: "",
    requerido: "",
    valor_causa: "",
    perito: "",
    status: "AGUARDANDO PERÍCIA",
    data_nomeacao: new Date(),
    data_pericia_agendada: undefined as Date | undefined,
    horario: "",
    endereco: "",
    email_reclamante: "",
    email_reclamada: "",
    data_prazo: undefined as Date | undefined,
    data_entrega: undefined as Date | undefined,
    prazo_esclarecimento: undefined as Date | undefined,
    data_esclarecimento: undefined as Date | undefined,
    data_recebimento: undefined as Date | undefined,
    valor_recebimento: "",
    honorarios: "",
    sentenca: "",
    observacoes: "",
  });

  const handleNr15Change = (value: number) => {
    setNr15Selected(prev => 
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const handleNr16Change = (value: number) => {
    setNr16Selected(prev => 
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase.from("pericias").insert({
        numero_processo: formData.numero_processo,
        link_processo: formData.link_processo || null,
        cidade: formData.cidade || null,
        vara: formData.vara,
        requerente: formData.requerente,
        funcao: formData.funcao || null,
        requerido: formData.requerido,
        valor_causa: formData.valor_causa ? parseFloat(formData.valor_causa) : null,
        nr15: nr15Selected.length > 0 ? nr15Selected : null,
        nr16: nr16Selected.length > 0 ? nr16Selected : null,
        perito: formData.perito,
        status: formData.status,
        data_nomeacao: formData.data_nomeacao.toISOString().split('T')[0],
        data_pericia_agendada: formData.data_pericia_agendada?.toISOString().split('T')[0] || null,
        horario: formData.horario || null,
        endereco: formData.endereco || null,
        email_reclamante: formData.email_reclamante || null,
        email_reclamada: formData.email_reclamada || null,
        data_prazo: formData.data_prazo?.toISOString().split('T')[0] || null,
        data_entrega: formData.data_entrega?.toISOString().split('T')[0] || null,
        prazo_esclarecimento: formData.prazo_esclarecimento?.toISOString().split('T')[0] || null,
        data_esclarecimento: formData.data_esclarecimento?.toISOString().split('T')[0] || null,
        data_recebimento: formData.data_recebimento?.toISOString().split('T')[0] || null,
        valor_recebimento: formData.valor_recebimento ? parseFloat(formData.valor_recebimento) : null,
        honorarios: formData.honorarios ? parseFloat(formData.honorarios) : null,
        sentenca: formData.sentenca || null,
        observacoes: formData.observacoes || null,
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
    <>
      <DialogHeader>
        <DialogTitle>Nova Perícia</DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-6 py-4">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Informações do Processo</h3>
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
              <Label htmlFor="link_processo">Link do Processo</Label>
              <Input
                id="link_processo"
                type="url"
                placeholder="https://..."
                value={formData.link_processo}
                onChange={(e) => setFormData({ ...formData, link_processo: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={formData.cidade}
                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vara">Nº da Vara *</Label>
              <Input
                id="vara"
                value={formData.vara}
                onChange={(e) => setFormData({ ...formData, vara: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="funcao">Função</Label>
              <Input
                id="funcao"
                value={formData.funcao}
                onChange={(e) => setFormData({ ...formData, funcao: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Partes</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="requerente">Reclamante *</Label>
              <Input
                id="requerente"
                value={formData.requerente}
                onChange={(e) => setFormData({ ...formData, requerente: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email_reclamante">Email Reclamante</Label>
              <Input
                id="email_reclamante"
                type="email"
                value={formData.email_reclamante}
                onChange={(e) => setFormData({ ...formData, email_reclamante: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requerido">Reclamada *</Label>
              <Input
                id="requerido"
                value={formData.requerido}
                onChange={(e) => setFormData({ ...formData, requerido: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email_reclamada">Email Reclamada</Label>
              <Input
                id="email_reclamada"
                type="email"
                value={formData.email_reclamada}
                onChange={(e) => setFormData({ ...formData, email_reclamada: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Valores</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="valor_causa">Valor da Causa (R$)</Label>
              <Input
                id="valor_causa"
                type="number"
                step="0.01"
                value={formData.valor_causa}
                onChange={(e) => setFormData({ ...formData, valor_causa: e.target.value })}
              />
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

            <div className="space-y-2">
              <Label htmlFor="valor_recebimento">Valor do Recebimento (R$)</Label>
              <Input
                id="valor_recebimento"
                type="number"
                step="0.01"
                value={formData.valor_recebimento}
                onChange={(e) => setFormData({ ...formData, valor_recebimento: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">NR's</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>NR15</Label>
              <div className="grid grid-cols-4 gap-2">
                {[...Array(14)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <Checkbox
                      id={`nr15-${i + 1}`}
                      checked={nr15Selected.includes(i + 1)}
                      onCheckedChange={() => handleNr15Change(i + 1)}
                    />
                    <label htmlFor={`nr15-${i + 1}`} className="text-sm">{i + 1}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>NR16</Label>
              <div className="grid grid-cols-4 gap-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <Checkbox
                      id={`nr16-${i + 1}`}
                      checked={nr16Selected.includes(i + 1)}
                      onCheckedChange={() => handleNr16Change(i + 1)}
                    />
                    <label htmlFor={`nr16-${i + 1}`} className="text-sm">{i + 1}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Datas e Horários</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Data de Nomeação *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.data_nomeacao, "dd/MM/yyyy", { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={formData.data_nomeacao}
                    onSelect={(date) => date && setFormData({ ...formData, data_nomeacao: date })}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Data da Perícia Agendada</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.data_pericia_agendada
                      ? format(formData.data_pericia_agendada, "dd/MM/yyyy", { locale: ptBR })
                      : "Selecione..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={formData.data_pericia_agendada}
                    onSelect={(date) => setFormData({ ...formData, data_pericia_agendada: date })}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="horario">Horário</Label>
              <Input
                id="horario"
                type="time"
                value={formData.horario}
                onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Prazo de Entrega do Laudo</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.data_prazo
                      ? format(formData.data_prazo, "dd/MM/yyyy", { locale: ptBR })
                      : "Selecione..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={formData.data_prazo}
                    onSelect={(date) => setFormData({ ...formData, data_prazo: date })}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Data de Entrega do Laudo</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.data_entrega
                      ? format(formData.data_entrega, "dd/MM/yyyy", { locale: ptBR })
                      : "Selecione..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={formData.data_entrega}
                    onSelect={(date) => setFormData({ ...formData, data_entrega: date })}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Prazo de Esclarecimento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.prazo_esclarecimento
                      ? format(formData.prazo_esclarecimento, "dd/MM/yyyy", { locale: ptBR })
                      : "Selecione..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={formData.prazo_esclarecimento}
                    onSelect={(date) => setFormData({ ...formData, prazo_esclarecimento: date })}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Data de Esclarecimento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.data_esclarecimento
                      ? format(formData.data_esclarecimento, "dd/MM/yyyy", { locale: ptBR })
                      : "Selecione..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={formData.data_esclarecimento}
                    onSelect={(date) => setFormData({ ...formData, data_esclarecimento: date })}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Data de Recebimento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.data_recebimento
                      ? format(formData.data_recebimento, "dd/MM/yyyy", { locale: ptBR })
                      : "Selecione..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={formData.data_recebimento}
                    onSelect={(date) => setFormData({ ...formData, data_recebimento: date })}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Informações Adicionais</h3>
          <div className="grid gap-4 md:grid-cols-2">
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
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="sentenca">Sentença</Label>
              <Textarea
                id="sentenca"
                value={formData.sentenca}
                onChange={(e) => setFormData({ ...formData, sentenca: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Cadastrando..." : "Adicionar Perícia"}
        </Button>
      </form>
    </>
  );
};

export default NovaPericia;
