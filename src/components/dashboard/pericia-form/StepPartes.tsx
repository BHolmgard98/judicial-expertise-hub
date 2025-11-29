import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StepPartesProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const StepPartes = ({ formData, setFormData }: StepPartesProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-base sm:text-lg border-b pb-2">Partes</h3>
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="requerente">Reclamante *</Label>
          <Input
            id="requerente"
            value={formData.requerente}
            onChange={(e) => setFormData({ ...formData, requerente: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email_reclamante">Email Reclamante</Label>
          <Input
            id="email_reclamante"
            type="text"
            placeholder="email1@exemplo.com; email2@exemplo.com"
            value={formData.email_reclamante}
            onChange={(e) => setFormData({ ...formData, email_reclamante: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">Separe múltiplos emails por ponto e vírgula (;)</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="requerido">Reclamada *</Label>
          <Input
            id="requerido"
            value={formData.requerido}
            onChange={(e) => setFormData({ ...formData, requerido: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email_reclamada">Email Reclamada</Label>
          <Input
            id="email_reclamada"
            type="text"
            placeholder="email1@exemplo.com; email2@exemplo.com"
            value={formData.email_reclamada}
            onChange={(e) => setFormData({ ...formData, email_reclamada: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">Separe múltiplos emails por ponto e vírgula (;)</p>
        </div>
      </div>
    </div>
  );
};
