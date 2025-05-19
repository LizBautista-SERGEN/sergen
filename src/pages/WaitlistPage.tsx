
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { FileIcon, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface WaitlistEntry {
  id: string;
  full_name: string;
  company_name: string;
  position: string;
  email: string;
  phone: string;
  plan_type: string;
  created_at: string;
  status: string;
  notes: string | null;
}

interface WaitlistInvoice {
  id: string;
  waitlist_id: string;
  file_name: string;
  file_path: string;
  created_at: string;
}

const WaitlistPage = () => {
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
      
      // Fetch all waitlist entries
      const { data: entries, error: entriesError } = await supabase
        .from("waitlist")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (entriesError) throw entriesError;
      
      // Fetch all invoices
      const { data: invoices, error: invoicesError } = await supabase
        .from("waitlist_invoices")
        .select("*");
      
      if (invoicesError) throw invoicesError;
      
      // Group invoices by waitlist_id
      const invoicesByWaitlistId = invoices.reduce<Record<string, WaitlistInvoice[]>>((acc, invoice) => {
        if (!acc[invoice.waitlist_id]) {
          acc[invoice.waitlist_id] = [];
        }
        acc[invoice.waitlist_id].push(invoice);
        return acc;
      }, {});
      
      setWaitlistEntries(entries || []);
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
      const { error } = await supabase
        .from("waitlist")
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

  const statusOptions = [
    { value: "pending", label: "Pendiente" },
    { value: "contacted", label: "Contactado" },
    { value: "converted", label: "Convertido" }
  ];

  const getPlanName = (planType: string) => {
    return planType === "basic" ? "Plan Básico" : "Plan Avanzado";
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <h1 className="text-2xl font-bold">Lista de Espera</h1>
      
      {loading ? (
        <div className="flex justify-center">
          <p>Cargando datos...</p>
        </div>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Facturas</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {waitlistEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-6">
                        No hay registros en la lista de espera
                      </TableCell>
                    </TableRow>
                  ) : (
                    waitlistEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.full_name}</TableCell>
                        <TableCell>{entry.company_name}</TableCell>
                        <TableCell>{entry.position}</TableCell>
                        <TableCell>
                          <div>{entry.email}</div>
                          <div className="text-gray-500">{entry.phone}</div>
                        </TableCell>
                        <TableCell>{getPlanName(entry.plan_type)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            entry.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                            entry.status === "contacted" ? "bg-blue-100 text-blue-800" :
                            "bg-green-100 text-green-800"
                          }`}>
                            {entry.status === "pending" ? "Pendiente" :
                             entry.status === "contacted" ? "Contactado" : "Convertido"}
                          </span>
                        </TableCell>
                        <TableCell>{new Date(entry.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => viewInvoices(entry.id)}
                          >
                            <FileIcon size={16} className="mr-1" />
                            {(invoicesMap[entry.id] || []).length}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedEntry(entry);
                              setStatus(entry.status);
                              setNotes(entry.notes || "");
                            }}
                          >
                            Editar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {/* Edit Dialog */}
          {selectedEntry && (
            <Dialog open={!!selectedEntry} onOpenChange={(open) => !open && setSelectedEntry(null)}>
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
          )}
          
          {/* Invoices Dialog */}
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
        </>
      )}
    </div>
  );
};

export default WaitlistPage;
