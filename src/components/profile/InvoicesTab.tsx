
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Upload, Trash2, Download, Loader2 } from "lucide-react";
import { supabase, PROJECT_ID } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Invoice {
  id: string;
  filename: string;
  file_path: string;
}

const InvoicesTab = () => {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch invoices on component mount
  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('No active session found');
        setInvoices([]);
        setIsLoading(false);
        return;
      }

      const userId = session.user.id;
      
      console.log(`Fetching invoices for user: ${userId}`);

      // Construir URL con parámetros de consulta en lugar de enviarlos en el cuerpo
      const functionUrl = `https://${PROJECT_ID}.supabase.co/functions/v1/upload-file?userId=${userId}&type=invoice`;
      console.log('Edge Function URL:', functionUrl);
      
      try {
        // Solicitud GET sin cuerpo
        const response = await fetch(functionUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Fetch error response:', errorText);
          throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Invoices fetched successfully:', data);
        setInvoices(data || []);
      } catch (fetchError: any) {
        console.error('Direct fetch error:', fetchError);
        throw fetchError;
      }
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
      setError(error.message || 'Error desconocido');
      toast({
        title: "Error",
        description: `No se pudieron cargar las facturas: ${error.message || 'Error desconocido'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Formato de archivo no permitido. Solo se aceptan PDF, XLS y XLSX.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      setUploading(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'invoice');
      formData.append('userId', session.user.id);

      console.log('Uploading invoice file:', file.name);
      
      // Use direct fetch for FormData
      const response = await fetch(`https://${PROJECT_ID}.supabase.co/functions/v1/upload-file`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error en la subida: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Invoice uploaded successfully:', data);

      toast({
        title: "Éxito",
        description: "Factura subida correctamente",
      });

      // Refresh invoices list
      fetchInvoices();
    } catch (error: any) {
      console.error('Error uploading invoice:', error);
      toast({
        title: "Error",
        description: `No se pudo subir la factura: ${error.message || 'Error desconocido'}`,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      console.log('Deleting invoice with ID:', id);
      
      const { error } = await supabase
        .from('documents')
        .update({ deleted: true })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Factura eliminada correctamente",
      });

      // Refresh invoices
      fetchInvoices();
    } catch (error: any) {
      console.error('Error deleting invoice:', error);
      toast({
        title: "Error",
        description: `No se pudo eliminar la factura: ${error.message || 'Error desconocido'}`,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="grid gap-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-4">
            <p className="font-semibold">Error al cargar facturas:</p>
            <p className="text-sm mt-1">{error}</p>
            <Button 
              onClick={fetchInvoices} 
              variant="outline" 
              size="sm"
              className="mt-2"
            >
              Reintentar
            </Button>
          </div>
        )}

        <div>
          <Label htmlFor="invoice-upload">Subir Nueva Factura</Label>
          <Input
            type="file"
            id="invoice-upload"
            className="hidden"
            accept=".pdf, .xls, .xlsx"
            onChange={handleFileUpload}
          />
          <Label
            htmlFor="invoice-upload"
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center block cursor-pointer hover:border-gray-400 mt-2"
          >
            {uploading ? (
              <Loader2 className="w-6 h-6 mx-auto animate-spin" />
            ) : (
              <Upload className="w-6 h-6 mx-auto" />
            )}
            <p className="text-gray-600">
              Arrastra o da clic para subir una factura (PDF, XLS, XLSX)
            </p>
          </Label>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Facturas Disponibles</h2>
          {isLoading ? (
            <div className="text-center py-4">
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              <p>Cargando facturas...</p>
            </div>
          ) : invoices.length === 0 ? (
            <p className="text-gray-500">No hay facturas disponibles</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {invoices.map((doc) => (
                <div key={doc.id} className="relative group">
                  <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="aspect-square flex items-center justify-center mb-2 bg-blue-50 rounded-lg">
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="text-sm font-medium text-center text-gray-700 truncate mb-3">
                      {doc.filename}
                    </div>
                    <div className="flex justify-center gap-2">
                      <a 
                        href={`${supabase.storage.from('invoices').getPublicUrl(doc.file_path).data.publicUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                      >
                        <Button size="sm" variant="outline" className="w-full flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          Descargar
                        </Button>
                      </a>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        className="flex items-center gap-1"
                        onClick={() => handleDelete(doc.id)}
                        disabled={deletingId === doc.id}
                      >
                        {deletingId === doc.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoicesTab;
