
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface InvoiceUploaderProps {
  invoices: File[];
  setInvoices: React.Dispatch<React.SetStateAction<File[]>>;
}

export const InvoiceUploader = ({ invoices, setInvoices }: InvoiceUploaderProps) => {
  const handleInvoiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Convert FileList to array and ensure we have max 6 files
      const newInvoices = Array.from(e.target.files);
      const combinedInvoices = [...invoices, ...newInvoices];
      
      // Limit to 6 files
      if (combinedInvoices.length > 6) {
        toast.warning("Máximo 6 facturas permitidas");
        setInvoices(combinedInvoices.slice(0, 6));
      } else {
        setInvoices(combinedInvoices);
      }
    }
  };
  
  const removeInvoice = (index: number) => {
    setInvoices(invoices.filter((_, i) => i !== index));
  };

  return (
    <>
      <div>
        <Label htmlFor="invoices">Últimas 6 facturas de energía eléctrica</Label>
        <Input
          id="invoices"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleInvoiceChange}
          multiple
          className="bg-blue-50/50"
        />
        <p className="text-xs text-gray-500 mt-1">Formatos: PDF, JPG, PNG. Máximo 6 archivos.</p>
      </div>
      
      {invoices.length > 0 && (
        <div className="border rounded p-3 bg-gray-50">
          <p className="text-sm font-medium mb-2">Facturas seleccionadas ({invoices.length}/6):</p>
          <ul className="space-y-1">
            {invoices.map((file, index) => (
              <li key={index} className="text-sm flex justify-between">
                <span className="truncate max-w-[80%]">{file.name}</span>
                <button 
                  type="button" 
                  onClick={() => removeInvoice(index)}
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};
