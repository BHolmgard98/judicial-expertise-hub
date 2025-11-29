import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface StepPrazosProps {
  formData: any;
  setFormData: (data: any) => void;
}

const getDaysRemaining = (date: Date | undefined) => {
  if (!date) return null;
  const days = differenceInDays(date, new Date());
  return days;
};

const DaysRemainingBadge = ({ days }: { days: number | null }) => {
  if (days === null) return null;
  
  const isOverdue = days < 0;
  const isUrgent = days >= 0 && days <= 7;
  
  return (
    <span
      className={cn(
        "ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap",
        isOverdue && "bg-destructive/20 text-destructive",
        isUrgent && !isOverdue && "bg-yellow-500/20 text-yellow-700",
        !isOverdue && !isUrgent && "bg-green-500/20 text-green-700"
      )}
    >
      {isOverdue ? `${Math.abs(days)}d atraso` : `${days}d`}
    </span>
  );
};

export const StepPrazos = ({ formData, setFormData }: StepPrazosProps) => {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm border-b pb-2">Prazos</h3>
      <div className="grid gap-3 grid-cols-2">
        <div className="space-y-1">
          <div className="flex items-center flex-wrap">
            <Label className="text-xs">Prazo Entrega Laudo</Label>
            <DaysRemainingBadge days={getDaysRemaining(formData.data_prazo)} />
          </div>
          <div className="flex gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start h-8 text-sm">
                  <CalendarIcon className="mr-2 h-3 w-3" />
                  {formData.data_prazo
                    ? format(formData.data_prazo, "dd/MM/yyyy", { locale: ptBR })
                    : "Selecione..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.data_prazo}
                  onSelect={(date) => setFormData({ ...formData, data_prazo: date })}
                  locale={ptBR}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {formData.data_prazo && (
              <Button 
                type="button" 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 shrink-0"
                onClick={() => setFormData({ ...formData, data_prazo: undefined })}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Data Entrega Laudo</Label>
          <div className="flex gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start h-8 text-sm">
                  <CalendarIcon className="mr-2 h-3 w-3" />
                  {formData.data_entrega
                    ? format(formData.data_entrega, "dd/MM/yyyy", { locale: ptBR })
                    : "Selecione..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.data_entrega}
                  onSelect={(date) => setFormData({ ...formData, data_entrega: date })}
                  locale={ptBR}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {formData.data_entrega && (
              <Button 
                type="button" 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 shrink-0"
                onClick={() => setFormData({ ...formData, data_entrega: undefined })}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center flex-wrap">
            <Label className="text-xs">Prazo Esclarecimento</Label>
            <DaysRemainingBadge days={getDaysRemaining(formData.prazo_esclarecimento)} />
          </div>
          <div className="flex gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start h-8 text-sm">
                  <CalendarIcon className="mr-2 h-3 w-3" />
                  {formData.prazo_esclarecimento
                    ? format(formData.prazo_esclarecimento, "dd/MM/yyyy", { locale: ptBR })
                    : "Selecione..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.prazo_esclarecimento}
                  onSelect={(date) => setFormData({ ...formData, prazo_esclarecimento: date })}
                  locale={ptBR}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {formData.prazo_esclarecimento && (
              <Button 
                type="button" 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 shrink-0"
                onClick={() => setFormData({ ...formData, prazo_esclarecimento: undefined })}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Data Entrega Esclarecimento</Label>
          <div className="flex gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start h-8 text-sm">
                  <CalendarIcon className="mr-2 h-3 w-3" />
                  {formData.data_esclarecimento
                    ? format(formData.data_esclarecimento, "dd/MM/yyyy", { locale: ptBR })
                    : "Selecione..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.data_esclarecimento}
                  onSelect={(date) => setFormData({ ...formData, data_esclarecimento: date })}
                  locale={ptBR}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {formData.data_esclarecimento && (
              <Button 
                type="button" 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 shrink-0"
                onClick={() => setFormData({ ...formData, data_esclarecimento: undefined })}
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