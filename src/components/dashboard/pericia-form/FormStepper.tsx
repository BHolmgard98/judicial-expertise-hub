import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  number: number;
  title: string;
}

interface FormStepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (step: number) => void;
}

export const FormStepper = ({ steps, currentStep, onStepClick }: FormStepperProps) => {
  return (
    <div className="mb-6">
      {/* Mobile: Compact stepper */}
      <div className="flex sm:hidden items-center justify-center gap-1 mb-2">
        {steps.map((step) => (
          <button
            key={step.number}
            type="button"
            onClick={() => onStepClick(step.number)}
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-colors",
              currentStep === step.number
                ? "bg-primary w-6"
                : currentStep > step.number
                ? "bg-primary/60"
                : "bg-muted"
            )}
          />
        ))}
      </div>
      <p className="text-center text-sm font-medium sm:hidden mb-4">
        Etapa {currentStep}: {steps.find(s => s.number === currentStep)?.title}
      </p>

      {/* Desktop: Full stepper */}
      <div className="hidden sm:flex items-center justify-between overflow-x-auto pb-2">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-shrink-0">
            <button
              type="button"
              onClick={() => onStepClick(step.number)}
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors",
                currentStep === step.number
                  ? "bg-primary text-primary-foreground"
                  : currentStep > step.number
                  ? "bg-primary/80 text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {currentStep > step.number ? (
                <Check className="h-4 w-4" />
              ) : (
                step.number
              )}
            </button>
            <span
              className={cn(
                "ml-2 text-xs font-medium whitespace-nowrap",
                currentStep >= step.number ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {step.title}
            </span>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-8 lg:w-12 h-0.5 mx-2",
                  currentStep > step.number ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const FORM_STEPS = [
  { number: 1, title: "Processo" },
  { number: 2, title: "Partes" },
  { number: 3, title: "NRs" },
  { number: 4, title: "Agendamento" },
  { number: 5, title: "Prazos" },
  { number: 6, title: "Honorários" },
  { number: 7, title: "Outros" },
];
