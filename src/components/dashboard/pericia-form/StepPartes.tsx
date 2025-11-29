import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StepPartesProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const StepPartes = ({ formData, setFormData }: StepPartesProps) => {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm sm:text-base border-b pb-2">Partes</h3>
      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="requerente" className="text-xs">Reclamante *</Label>
          <Input
            id="requerente"
            value={formData.requerente}
            onChange={(e) => setFormData({ ...formData, requerente: e.target.value })}
            required
            className="h-8 text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="email_reclamante" className="text-xs">Email Reclamante</Label>
          <Input
            id="email_reclamante"
            type="text"
            placeholder="email@exemplo.com"
            value={formData.email_reclamante}
            onChange={(e) => setFormData({ ...formData, email_reclamante: e.target.value })}
            className="h-8 text-sm"
          />
          <p className="text-[10px] text-muted-foreground">Separe múltiplos por ;</p>
        </div>

        <div className="space-y-1">
          <Label htmlFor="requerido" className="text-xs">Reclamada *</Label>
          <Input
            id="requerido"
            value={formData.requerido}
            onChange={(e) => setFormData({ ...formData, requerido: e.target.value })}
            required
            className="h-8 text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="email_reclamada" className="text-xs">Email Reclamada</Label>
          <Input
            id="email_reclamada"
            type="text"
            placeholder="email@exemplo.com"
            value={formData.email_reclamada}
            onChange={(e) => setFormData({ ...formData, email_reclamada: e.target.value })}
            className="h-8 text-sm"
          />
          <p className="text-[10px] text-muted-foreground">Separe múltiplos por ;</p>
        </div>
      </div>
    </div>
  );
};