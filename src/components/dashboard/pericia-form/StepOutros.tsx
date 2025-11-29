import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATUS_OPTIONS } from "@/lib/statusColors";

interface StepOutrosProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const StepOutros = ({ formData, setFormData }: StepOutrosProps) => {
  return (
    <div className="space-y-3 min-w-0 w-full">
      <h3 className="font-semibold text-sm border-b pb-2">Observações e Outros</h3>
      
      <div className="space-y-1">
        <Label htmlFor="observacoes" className="text-xs">Observações</Label>
        <Textarea
          id="observacoes"
          value={formData.observacoes}
          onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
          rows={2}
          placeholder="Adicione observações relevantes..."
          className="text-sm resize-none"
        />
      </div>

      <div className="grid gap-3 grid-cols-2 min-w-0">
        <div className="space-y-1">
          <Label className="text-xs">Deslocamento</Label>
          <Select
            value={formData.deslocamento}
            onValueChange={(value) => setFormData({ 
              ...formData, 
              deslocamento: value,
              estacao: value !== "TRANSPORTE PÚBLICO" ? "" : formData.estacao,
              linha_numero: value !== "TRANSPORTE PÚBLICO" ? "" : formData.linha_numero,
              linha_cor: value !== "TRANSPORTE PÚBLICO" ? "" : formData.linha_cor,
            })}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CARRO">Carro</SelectItem>
              <SelectItem value="TRANSPORTE PÚBLICO">Transporte Público</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {formData.deslocamento === "TRANSPORTE PÚBLICO" && (
        <div className="grid gap-3 grid-cols-3 pt-2 border-t min-w-0">
          <div className="space-y-1">
            <Label htmlFor="estacao" className="text-xs">Estação</Label>
            <Input
              id="estacao"
              value={formData.estacao}
              onChange={(e) => setFormData({ ...formData, estacao: e.target.value })}
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="linha_numero" className="text-xs">Nº da Linha</Label>
            <Input
              id="linha_numero"
              value={formData.linha_numero}
              onChange={(e) => setFormData({ ...formData, linha_numero: e.target.value })}
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="linha_cor" className="text-xs">Cor da Linha</Label>
            <Input
              id="linha_cor"
              value={formData.linha_cor}
              onChange={(e) => setFormData({ ...formData, linha_cor: e.target.value })}
              className="h-8 text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
};