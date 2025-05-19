
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseWaitlistFormProps {
  plan: string;
  onComplete: () => void;
}

export const useWaitlistForm = ({ plan, onComplete }: UseWaitlistFormProps) => {
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [position, setPosition] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [invoices, setInvoices] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  
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
      const waitlistData = {
        full_name: fullName,
        company_name: companyName,
        position,
        email,
        phone,
        plan_type: plan,
      };
      
      // Use type assertion with any to bypass type checking
      const { data: waitlistEntry, error: waitlistError } = await (supabase
        .from("waitlist") as any)
        .insert(waitlistData)
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
        const invoiceData = {
          waitlist_id: waitlistId,
          file_name: file.name,
          file_path: filePath,
        };
        
        // Use type assertion with any to bypass type checking
        const { error: invoiceRecordError } = await (supabase
          .from("waitlist_invoices") as any)
          .insert(invoiceData);
        
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

  return {
    fullName,
    setFullName,
    companyName,
    setCompanyName,
    position,
    setPosition,
    email,
    setEmail,
    phone,
    setPhone,
    invoices,
    setInvoices,
    loading,
    handleSubmit
  };
};
