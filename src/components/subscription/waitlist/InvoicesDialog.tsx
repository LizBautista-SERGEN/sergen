
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { WaitlistInvoice } from "@/types/waitlist";

interface InvoicesDialogProps {
  showInvoices: boolean;
  setShowInvoices: (show: boolean) => void;
  selectedWaitlistId: string | null;
  invoicesMap: Record<string, WaitlistInvoice[]>;
  downloadInvoice: (filePath: string, fileName: string) => Promise<void>;
}

export const InvoicesDialog = ({
  showInvoices,
  setShowInvoices,
  selectedWaitlistId,
  invoicesMap,
  downloadInvoice
}: InvoicesDialogProps) => {
  return (
    <Dialog open={showInvoices} onOpenChange={setShowInvoices}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Facturas</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          {selectedWaitlistId && invoicesMap[selectedWaitlistId]?.length > 0 ? (
            <div className="space-y-2">
              {invoicesMap[selectedWaitlistId].map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-2 border rounded">
                  <span className="truncate max-w-[70%]">{invoice.file_name}</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => downloadInvoice(invoice.file_path, invoice.file_name)}
                  >
                    <Download size={16} className="mr-1" />
                    Descargar
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-4">No hay facturas disponibles</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
