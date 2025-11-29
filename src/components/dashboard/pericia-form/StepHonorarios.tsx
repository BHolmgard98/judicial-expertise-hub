import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrencyInput } from "@/lib/utils";

interface StepHonorariosProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const StepHonorarios = ({ formData, setFormData }: StepHonorariosProps) => {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm sm:text-base border-b pb-2">Honorários</h3>
      <div className="grid gap-2 grid-cols-1 sm:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="honorarios" className="text-xs">Honorários (R$)</Label>
          <Input
            id="honorarios"
            type="text"
            placeholder="1.234,56"
            value={formData.honorarios}
            onChange={(e) => setFormData({ ...formData, honorarios: formatCurrencyInput(e.target.value) })}
            className="h-8 text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="valor_recebimento" className="text-xs">Valor Recebimento (R$)</Label>
          <Input
            id="valor_recebimento"
            type="text"
            placeholder="1.234,56"
            value={formData.valor_recebimento}
            onChange={(e) => setFormData({ ...formData, valor_recebimento: formatCurrencyInput(e.target.value) })}
            className="h-8 text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Data Recebimento</Label>
          <div className="flex gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start h-8 text-sm">
                  <CalendarIcon className="mr-2 h-3 w-3" />
                  {formData.data_recebimento
                    ? format(formData.data_recebimento, "dd/MM/yyyy", { locale: ptBR })
                    : "Selecione..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.data_recebimento}
                  onSelect={(date) => setFormData({ ...formData, data_recebimento: date })}
                  locale={ptBR}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {formData.data_recebimento && (
              <Button 
                type="button" 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 shrink-0"
                onClick={() => setFormData({ ...formData, data_recebimento: undefined })}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};