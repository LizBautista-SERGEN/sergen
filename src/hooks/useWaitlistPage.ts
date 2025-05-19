
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { WaitlistEntry, WaitlistInvoice } from "@/types/waitlist";

export const useWaitlistPage = () => {
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [invoicesMap, setInvoicesMap] = useState<Record<string, WaitlistInvoice[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<WaitlistEntry | null>(null);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const [showInvoices, setShowInvoices] = useState(false);
  const [selectedWaitlistId, setSelectedWaitlistId] = useState<string | null>(null);

  useEffect(() => {
    fetchWaitlistData();
  }, []);

  const fetchWaitlistData = async () => {
    try {
      setLoading(true);
      
      // Use type assertion with any to bypass type checking
      const { data: entries, error: entriesError } = await (supabase
        .from("waitlist") as any)
        .select("*")
        .order("created_at", { ascending: false });
      
      if (entriesError) throw entriesError;
      
      // Use type assertion with any to bypass type checking
      const { data: invoices, error: invoicesError } = await (supabase
        .from("waitlist_invoices") as any)
        .select("*");
      
      if (invoicesError) throw invoicesError;
      
      // Group invoices by waitlist_id
      const invoicesByWaitlistId = invoices ? invoices.reduce((acc: Record<string, WaitlistInvoice[]>, invoice: any) => {
        if (!acc[invoice.waitlist_id]) {
          acc[invoice.waitlist_id] = [];
        }
        acc[invoice.waitlist_id].push(invoice as WaitlistInvoice);
        return acc;
      }, {}) : {};
      
      setWaitlistEntries(entries as WaitlistEntry[] || []);
      setInvoicesMap(invoicesByWaitlistId);
    } catch (error: any) {
      console.error("Error fetching waitlist data:", error);
      toast.error("Error al cargar los datos: " + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const updateWaitlistEntry = async () => {
    if (!selectedEntry) return;
    
    try {
      // Use type assertion with any to bypass type checking
      const { error } = await (supabase
        .from("waitlist") as any)
        .update({
          status: status,
          notes: notes
        })
        .eq("id", selectedEntry.id);
      
      if (error) throw error;
      
      toast.success("Información actualizada correctamente");
      
      // Update the local state
      setWaitlistEntries(waitlistEntries.map(entry => 
        entry.id === selectedEntry.id ? { ...entry, status, notes } : entry
      ));
      
      setSelectedEntry(null);
    } catch (error: any) {
      console.error("Error updating waitlist entry:", error);
      toast.error("Error al actualizar la información: " + error.message);
    }
  };

  const downloadInvoice = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("invoices")
        .download(filePath);
      
      if (error) throw error;
      
      // Create a download link
      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error: any) {
      console.error("Error downloading file:", error);
      toast.error("Error al descargar el archivo: " + error.message);
    }
  };
  
  const viewInvoices = (waitlistId: string) => {
    setSelectedWaitlistId(waitlistId);
    setShowInvoices(true);
  };

  return {
    waitlistEntries,
    invoicesMap,
    loading,
    selectedEntry,
    setSelectedEntry,
    notes,
    setNotes,
    status,
    setStatus,
    showInvoices,
    setShowInvoices,
    selectedWaitlistId,
    updateWaitlistEntry,
    downloadInvoice,
    viewInvoices
  };
};
