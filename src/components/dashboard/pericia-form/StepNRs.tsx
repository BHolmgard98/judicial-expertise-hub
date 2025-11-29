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
    <div className="space-y-3">
      <h3 className="font-semibold text-sm sm:text-base border-b pb-2">NR's</h3>
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-xs font-medium">NR15 - Insalubres</Label>
          <div className="grid grid-cols-1 gap-1 max-h-[150px] overflow-y-auto pr-1">
            {NR15_KEYS.map((anexo) => (
              <div key={anexo} className="flex items-center space-x-2 p-1.5 rounded hover:bg-muted/50">
                <Checkbox
                  id={`nr15-${anexo}`}
                  checked={nr15Selected.includes(anexo)}
                  onCheckedChange={() => onNr15Change(anexo)}
                  className="h-3.5 w-3.5"
                />
                <label htmlFor={`nr15-${anexo}`} className="text-xs cursor-pointer flex-1 truncate">
                  Anexo {anexo} - {getNR15Label(anexo)}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium">NR16 - Perigosas</Label>
          <div className="grid grid-cols-1 gap-1 max-h-[150px] overflow-y-auto pr-1">
            {NR16_KEYS.map((anexo) => (
              <div key={anexo} className="flex items-center space-x-2 p-1.5 rounded hover:bg-muted/50">
                <Checkbox
                  id={`nr16-${anexo}`}
                  checked={nr16Selected.includes(anexo)}
                  onCheckedChange={() => onNr16Change(anexo)}
                  className="h-3.5 w-3.5"
                />
                <label htmlFor={`nr16-${anexo}`} className="text-xs cursor-pointer flex-1 truncate">
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