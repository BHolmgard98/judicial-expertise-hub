import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { NR15_KEYS, NR16_KEYS, getNR15Label, getNR16Label } from "@/lib/nrAnexos";

interface StepNRsProps {
  nr15Selected: number[];
  nr16Selected: number[];
  onNr15Change: (value: number) => void;
  onNr16Change: (value: number) => void;
}

export const StepNRs = ({ nr15Selected, nr16Selected, onNr15Change, onNr16Change }: StepNRsProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg border-b pb-2">NR's</h3>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <Label className="text-base font-medium">NR15 - Atividades e Operações Insalubres</Label>
          <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2">
            {NR15_KEYS.map((anexo) => (
              <div key={anexo} className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50">
                <Checkbox
                  id={`nr15-${anexo}`}
                  checked={nr15Selected.includes(anexo)}
                  onCheckedChange={() => onNr15Change(anexo)}
                />
                <label htmlFor={`nr15-${anexo}`} className="text-sm cursor-pointer flex-1">
                  Anexo {anexo} - {getNR15Label(anexo)}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-medium">NR16 - Atividades e Operações Perigosas</Label>
          <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2">
            {NR16_KEYS.map((anexo) => (
              <div key={anexo} className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50">
                <Checkbox
                  id={`nr16-${anexo}`}
                  checked={nr16Selected.includes(anexo)}
                  onCheckedChange={() => onNr16Change(anexo)}
                />
                <label htmlFor={`nr16-${anexo}`} className="text-sm cursor-pointer flex-1">
                  Anexo {anexo} - {getNR16Label(anexo)}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
