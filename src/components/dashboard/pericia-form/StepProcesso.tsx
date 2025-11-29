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
    <div className="space-y-3 min-w-0 w-full">
      <h3 className="font-semibold text-sm border-b pb-2">Informações do Processo</h3>
      <div className="grid gap-3 grid-cols-2 min-w-0">
        <div className="space-y-1">
          <Label htmlFor="numero_processo" className="text-xs">Número do Processo *</Label>
          <Input
            id="numero_processo"
            value={formData.numero_processo}
            onChange={(e) => setFormData({ ...formData, numero_processo: e.target.value })}
            required
            className="h-8 text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="link_processo" className="text-xs">Link do Processo</Label>
          <Input
            id="link_processo"
            type="url"
            placeholder="https://..."
            value={formData.link_processo}
            onChange={(e) => setFormData({ ...formData, link_processo: e.target.value })}
            className="h-8 text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Data de Nomeação *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start h-8 text-sm">
                <CalendarIcon className="mr-2 h-3 w-3" />
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

        <div className="space-y-1">
          <Label htmlFor="cidade" className="text-xs">Cidade</Label>
          <Input
            id="cidade"
            value={formData.cidade}
            onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
            className="h-8 text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="endereco" className="text-xs">Endereço</Label>
          <Input
            id="endereco"
            value={formData.endereco}
            onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
            className="h-8 text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="vara" className="text-xs">Nº da Vara *</Label>
          <Input
            id="vara"
            value={formData.vara}
            onChange={(e) => setFormData({ ...formData, vara: e.target.value })}
            required
            className="h-8 text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="funcao" className="text-xs">Função</Label>
          <Input
            id="funcao"
            value={formData.funcao}
            onChange={(e) => setFormData({ ...formData, funcao: e.target.value })}
            className="h-8 text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="valor_causa" className="text-xs">Valor da Causa (R$)</Label>
          <Input
            id="valor_causa"
            type="text"
            placeholder="1.234,56"
            value={formData.valor_causa}
            onChange={(e) => setFormData({ ...formData, valor_causa: formatCurrencyInput(e.target.value) })}
            className="h-8 text-sm"
          />
        </div>
      </div>
    </div>
  );
};
