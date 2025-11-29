import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { formatCurrency, parseCurrencyBR, parseDateSafe } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import {
  FormStepper,
  FORM_STEPS,
  StepProcesso,
  StepPartes,
  StepNRs,
  StepAgendamento,
  StepPrazos,
  StepHonorarios,
  StepOutros,
} from "./pericia-form";

interface EditarPericiaProps {
  pericia: any;
  onSuccess: () => void;
}

const EditarPericia = ({ pericia, onSuccess }: EditarPericiaProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showUpdateCalendarDialog, setShowUpdateCalendarDialog] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<any>(null);
  const [nr15Selected, setNr15Selected] = useState<number[]>(pericia?.nr15 || []);
  const [nr16Selected, setNr16Selected] = useState<number[]>(pericia?.nr16 || []);
  
  if (!pericia) {
    return null;
  }
  
  const [formData, setFormData] = useState({
    numero_processo: pericia.numero_processo,
    link_processo: pericia.link_processo || "",
    cidade: pericia.cidade || "",
    vara: pericia.vara,
    requerente: pericia.requerente,
    funcao: pericia.funcao || "",
    requerido: pericia.requerido,
    valor_causa: pericia.valor_causa ? formatCurrency(pericia.valor_causa) : "",
    perito: pericia.perito,
    status: pericia.status,
    data_nomeacao: parseDateSafe(pericia.data_nomeacao) || new Date(),
    data_pericia_agendada: parseDateSafe(pericia.data_pericia_agendada),
    horario: pericia.horario || "",
    endereco: pericia.endereco || "",
    email_reclamante: pericia.email_reclamante || "",
    email_reclamada: pericia.email_reclamada || "",
    data_prazo: parseDateSafe(pericia.data_prazo),
    data_entrega: parseDateSafe(pericia.data_entrega),
    prazo_esclarecimento: parseDateSafe(pericia.prazo_esclarecimento),
    data_esclarecimento: parseDateSafe(pericia.data_esclarecimento),
    data_recebimento: parseDateSafe(pericia.data_recebimento),
    valor_recebimento: pericia.valor_recebimento ? formatCurrency(pericia.valor_recebimento) : "",
    honorarios: pericia.honorarios ? formatCurrency(pericia.honorarios) : "",
    deslocamento: pericia.deslocamento || "",
    estacao: pericia.estacao || "",
    linha_numero: pericia.linha_numero || "",
    linha_cor: pericia.linha_cor || "",
    observacoes: pericia.observacoes || "",
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

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        if (!formData.numero_processo || !formData.vara) {
          toast({
            title: "Campos obrigatórios",
            description: "Preencha o número do processo e a vara",
            variant: "destructive",
          });
          return false;
        }
        return true;
      case 2:
        if (!formData.requerente || !formData.requerido) {
          toast({
            title: "Campos obrigatórios",
            description: "Preencha o reclamante e a reclamada",
            variant: "destructive",
          });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 7));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCurrentStep()) return;
    
    const isEditingAguardandoPericia = 
      pericia.status === "AGUARDANDO PERÍCIA" && 
      formData.status === "AGUARDANDO PERÍCIA";

    if (isEditingAguardandoPericia) {
      setPendingUpdate({
        formData,
        nr15Selected,
        nr16Selected,
      });
      setShowUpdateCalendarDialog(true);
      return;
    }

    await processUpdate(false);
  };

  const processUpdate = async (shouldUpdateCalendar: boolean) => {
    setLoading(true);

    try {
      const shouldSyncCalendar = 
        pericia.status === "AGENDAR PERÍCIA" && 
        formData.status === "AGUARDANDO PERÍCIA";

      const shouldCreateDeadlineReminder = 
        (formData.data_entrega && (!pericia.data_entrega || formData.data_entrega.toISOString() !== new Date(pericia.data_entrega).toISOString())) ||
        (formData.data_esclarecimento && (!pericia.data_esclarecimento || formData.data_esclarecimento.toISOString() !== new Date(pericia.data_esclarecimento).toISOString()));

      const { error } = await supabase
        .from("pericias")
        .update({
          numero_processo: formData.numero_processo,
          link_processo: formData.link_processo || null,
          cidade: formData.cidade || null,
          vara: formData.vara,
          requerente: formData.requerente,
          funcao: formData.funcao || null,
          requerido: formData.requerido,
          valor_causa: formData.valor_causa ? parseCurrencyBR(formData.valor_causa) : null,
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
          valor_recebimento: formData.valor_recebimento ? parseCurrencyBR(formData.valor_recebimento) : null,
          honorarios: formData.honorarios ? parseCurrencyBR(formData.honorarios) : null,
          deslocamento: formData.deslocamento || null,
          estacao: formData.estacao || null,
          linha_numero: formData.linha_numero || null,
          linha_cor: formData.linha_cor || null,
          observacoes: formData.observacoes || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", pericia.id);

      if (error) throw error;

      if (shouldSyncCalendar || shouldUpdateCalendar) {
        try {
          const { error: calendarError } = await supabase.functions.invoke('google-calendar-sync', {
            body: {
              tipo: 'pericia',
              numero_processo: formData.numero_processo,
              requerente: formData.requerente,
              requerido: formData.requerido,
              data_pericia_agendada: formData.data_pericia_agendada?.toISOString().split('T')[0],
              horario: formData.horario,
              endereco: formData.endereco,
              observacoes: formData.observacoes,
              link_processo: formData.link_processo,
              funcao: formData.funcao,
              nr15: nr15Selected,
              nr16: nr16Selected,
            }
          });

          if (calendarError) {
            console.error('Erro ao sincronizar com Google Calendar:', calendarError);
            toast({
              title: "Perícia atualizada",
              description: "Perícia salva, mas houve erro ao sincronizar com Google Calendar",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Perícia atualizada e agendada",
              description: "As alterações foram salvas e o evento foi criado no Google Calendar",
            });
          }
        } catch (calendarError: any) {
          console.error('Erro ao sincronizar com Google Calendar:', calendarError);
          toast({
            title: "Perícia atualizada",
            description: "Perícia salva, mas houve erro ao sincronizar com Google Calendar",
            variant: "destructive",
          });
        }
      }

      if (shouldCreateDeadlineReminder) {
        if (formData.data_entrega && (!pericia.data_entrega || formData.data_entrega.toISOString() !== new Date(pericia.data_entrega).toISOString())) {
          await supabase.functions.invoke('google-calendar-sync', {
            body: {
              tipo: 'prazo_entrega',
              numero_processo: formData.numero_processo,
              requerente: formData.requerente,
              data_prazo: formData.data_entrega.toISOString().split('T')[0],
            },
          });
        }
        
        if (formData.data_esclarecimento && (!pericia.data_esclarecimento || formData.data_esclarecimento.toISOString() !== new Date(pericia.data_esclarecimento).toISOString())) {
          await supabase.functions.invoke('google-calendar-sync', {
            body: {
              tipo: 'prazo_esclarecimento',
              numero_processo: formData.numero_processo,
              requerente: formData.requerente,
              data_prazo: formData.data_esclarecimento.toISOString().split('T')[0],
            },
          });
        }
      }

      if (!shouldSyncCalendar && !shouldUpdateCalendar) {
        toast({
          title: "Perícia atualizada",
          description: "As alterações foram salvas com sucesso",
        });
      }

      onSuccess();
      setShowUpdateCalendarDialog(false);
      setPendingUpdate(null);
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepProcesso formData={formData} setFormData={setFormData} />;
      case 2:
        return <StepPartes formData={formData} setFormData={setFormData} />;
      case 3:
        return (
          <StepNRs
            nr15Selected={nr15Selected}
            nr16Selected={nr16Selected}
            onNr15Change={handleNr15Change}
            onNr16Change={handleNr16Change}
          />
        );
      case 4:
        return <StepAgendamento formData={formData} setFormData={setFormData} />;
      case 5:
        return <StepPrazos formData={formData} setFormData={setFormData} />;
      case 6:
        return <StepHonorarios formData={formData} setFormData={setFormData} />;
      case 7:
        return <StepOutros formData={formData} setFormData={setFormData} />;
      default:
        return null;
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Editar Perícia #{pericia.numero}</DialogTitle>
        <DialogDescription>Edite os dados da perícia em {FORM_STEPS.length} etapas</DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="py-2 flex flex-col">
        <FormStepper
          steps={FORM_STEPS}
          currentStep={currentStep}
          onStepClick={setCurrentStep}
        />

        <div className="flex-1">
          {renderStep()}
        </div>

        <div className="flex justify-between mt-4 pt-4 border-t gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>

          <div className="flex gap-2">
            {currentStep < 7 ? (
              <Button type="button" onClick={handleNext}>
                Próximo
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-1" />
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            )}
          </div>
        </div>
      </form>

      <AlertDialog open={showUpdateCalendarDialog} onOpenChange={setShowUpdateCalendarDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Atualizar Google Calendar?</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja também atualizar o evento no Google Calendar com as novas informações?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowUpdateCalendarDialog(false);
              processUpdate(false);
            }}>
              Não, apenas salvar
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => processUpdate(true)}>
              Sim, atualizar calendário
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EditarPericia;
