
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WaitlistEntry } from "@/types/waitlist";

interface EditWaitlistDialogProps {
  selectedEntry: WaitlistEntry | null;
  status: string;
  setStatus: (status: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  updateWaitlistEntry: () => Promise<void>;
  onOpenChange: (open: boolean) => void;
}

export const EditWaitlistDialog = ({
  selectedEntry,
  status,
  setStatus,
  notes,
  setNotes,
  updateWaitlistEntry,
  onOpenChange
}: EditWaitlistDialogProps) => {
  if (!selectedEntry) return null;

  const statusOptions = [
    { value: "pending", label: "Pendiente" },
    { value: "contacted", label: "Contactado" },
    { value: "converted", label: "Convertido" }
  ];

  const getPlanName = (planType: string) => {
    return planType === "basic" ? "Plan Básico" : "Plan Avanzado";
  };

  return (
    <Dialog open={!!selectedEntry} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Actualizar Estado</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div>
            <p><span className="font-medium">Nombre:</span> {selectedEntry.full_name}</p>
            <p><span className="font-medium">Empresa:</span> {selectedEntry.company_name}</p>
            <p><span className="font-medium">Plan:</span> {getPlanName(selectedEntry.plan_type)}</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea 
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Agregar notas sobre este contacto"
              rows={4}
            />
          </div>
          
          <Button 
            onClick={updateWaitlistEntry}
            className="w-full bg-sergen-500 hover:bg-sergen-600"
          >
            Actualizar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
