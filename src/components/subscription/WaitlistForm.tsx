
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WaitlistFormProps {
  plan: string;
  onComplete: () => void;
}

export const WaitlistForm = ({ plan, onComplete }: WaitlistFormProps) => {
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [position, setPosition] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [invoices, setInvoices] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (invoices.length < 1) {
      toast.error("Por favor cargue al menos una factura");
      return;
    }
    
    if (invoices.length > 6) {
      toast.error("Máximo 6 facturas permitidas");
      return;
    }
    
    try {
      setLoading(true);
      
      // 1. Insert into waitlist table
      const { data: waitlistEntry, error: waitlistError } = await supabase
        .from("waitlist")
        .insert({
          full_name: fullName,
          company_name: companyName,
          position,
          email,
          phone,
          plan_type: plan,
        })
        .select()
        .single();
      
      if (waitlistError) {
        throw waitlistError;
      }
      
      // 2. Upload each invoice
      const waitlistId = waitlistEntry.id;
      const uploadPromises = invoices.map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${waitlistId}_${index}.${fileExt}`;
        const filePath = `${waitlistId}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('invoices')
          .upload(filePath, file);
        
        if (uploadError) throw uploadError;
        
        // 3. Insert record into waitlist_invoices table
        const { error: invoiceRecordError } = await supabase
          .from("waitlist_invoices")
          .insert({
            waitlist_id: waitlistId,
            file_name: file.name,
            file_path: filePath,
          });
        
        if (invoiceRecordError) throw invoiceRecordError;
      });
      
      await Promise.all(uploadPromises);
      
      toast.success("¡Solicitud enviada correctamente!");
      onComplete();
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Error al enviar la solicitud: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="fullName">Nombres completos</Label>
        <Input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Ingrese sus nombres completos"
          required
          className="bg-blue-50/50"
        />
      </div>
      
      <div>
        <Label htmlFor="companyName">Empresa</Label>
        <Input
          id="companyName"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Nombre de su empresa"
          required
          className="bg-blue-50/50"
        />
      </div>
      
      <div>
        <Label htmlFor="position">Cargo</Label>
        <Input
          id="position"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          placeholder="Su cargo en la empresa"
          required
          className="bg-blue-50/50"
        />
      </div>
      
      <div>
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ejemplo@correo.com"
          required
          className="bg-blue-50/50"
        />
      </div>
      
      <div>
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Número de contacto"
          required
          className="bg-blue-50/50"
        />
      </div>
      
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
      
      <Button 
        type="submit" 
        className="w-full bg-sergen-500 hover:bg-sergen-600"
        disabled={loading}
      >
        {loading ? "Enviando..." : "Enviar solicitud"}
      </Button>
    </form>
  );
};
