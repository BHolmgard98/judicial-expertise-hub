import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { parseCurrencyBR } from "@/lib/utils";
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

interface NovaPericiaProps {
  onSuccess: (nr15: number[], nr16: number[]) => void;
}

const NovaPericia = ({ onSuccess }: NovaPericiaProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
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
    perito: "Engº Arthur Reis",
    status: "AGENDAR PERÍCIA",
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
    deslocamento: "",
    estacao: "",
    linha_numero: "",
    linha_cor: "",
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
        user_id: user.id,
      } as any);

      if (error) throw error;

      toast({
        title: "Perícia cadastrada",
        description: "A perícia foi adicionada com sucesso",
      });

      onSuccess(nr15Selected, nr16Selected);
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
        <DialogTitle>Nova Perícia</DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="py-4">
        <FormStepper
          steps={FORM_STEPS}
          currentStep={currentStep}
          onStepClick={setCurrentStep}
        />

        <div className="min-h-[250px] sm:min-h-[300px]">
          {renderStep()}
        </div>

        <div className="flex justify-between mt-4 sm:mt-6 pt-4 border-t gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            size="sm"
            className="sm:size-default"
          >
            <ChevronLeft className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Anterior</span>
          </Button>

          <div className="flex gap-2">
            {currentStep < 7 ? (
              <Button type="button" onClick={handleNext} size="sm" className="sm:size-default">
                <span className="hidden sm:inline">Próximo</span>
                <ChevronRight className="h-4 w-4 sm:ml-2" />
              </Button>
            ) : (
              <Button type="submit" disabled={loading} size="sm" className="sm:size-default">
                <Save className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{loading ? "Salvando..." : "Adicionar Perícia"}</span>
                <span className="sm:hidden">{loading ? "..." : "Salvar"}</span>
              </Button>
            )}
          </div>
        </div>
      </form>
    </>
  );
};

export default NovaPericia;
