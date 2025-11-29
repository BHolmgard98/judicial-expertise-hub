import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface StepAgendamentoProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const StepAgendamento = ({ formData, setFormData }: StepAgendamentoProps) => {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm sm:text-base border-b pb-2">Data e Horário da Perícia</h3>
      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-xs">Data da Perícia Agendada</Label>
          <div className="flex gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start h-8 text-sm">
                  <CalendarIcon className="mr-2 h-3 w-3" />
                  {formData.data_pericia_agendada
                    ? format(formData.data_pericia_agendada, "dd/MM/yyyy", { locale: ptBR })
                    : "Selecione..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.data_pericia_agendada}
                  onSelect={(date) => setFormData({ ...formData, data_pericia_agendada: date })}
                  locale={ptBR}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {formData.data_pericia_agendada && (
              <Button 
                type="button" 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 shrink-0"
                onClick={() => setFormData({ ...formData, data_pericia_agendada: undefined })}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="horario" className="text-xs">Horário</Label>
          <Input
            id="horario"
            type="time"
            value={formData.horario}
            onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
            className="h-8 text-sm"
          />
        </div>
      </div>
    </div>
  );
};