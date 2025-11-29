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
    <div className="space-y-4">
      <h3 className="font-semibold text-lg border-b pb-2">Data e Horário da Perícia</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Data da Perícia Agendada</Label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
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
                onClick={() => setFormData({ ...formData, data_pericia_agendada: undefined })}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
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
      </div>
    </div>
  );
};
