import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrencyInput } from "@/lib/utils";

interface StepProcessoProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const StepProcesso = ({ formData, setFormData }: StepProcessoProps) => {
  return (
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
          <Label>Data de Nomeação *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(formData.data_nomeacao, "dd/MM/yyyy", { locale: ptBR })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.data_nomeacao}
                onSelect={(date) => date && setFormData({ ...formData, data_nomeacao: date })}
                locale={ptBR}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
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
          <Label htmlFor="endereco">Endereço</Label>
          <Input
            id="endereco"
            value={formData.endereco}
            onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
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

        <div className="space-y-2">
          <Label htmlFor="valor_causa">Valor da Causa (R$)</Label>
          <Input
            id="valor_causa"
            type="text"
            placeholder="1.234,56"
            value={formData.valor_causa}
            onChange={(e) => setFormData({ ...formData, valor_causa: formatCurrencyInput(e.target.value) })}
          />
        </div>
      </div>
    </div>
  );
};
