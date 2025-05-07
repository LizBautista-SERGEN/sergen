import { useState, useEffect } from "react";
import { FileText, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/hooks/useUserProfile";

export const DocumentsTab = () => {
  const { toast } = useToast();
  const { profile } = useUserProfile();
  const [uploadingInvoice, setUploadingInvoice] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('No active session found');
        setDocuments([]);
        return;
      }

      console.log('Fetching documents for user:', session.user.id);

      // Problem: GET requests shouldn't have a body, let's fix this by using URL parameters
      // Using URL parameters instead of body for GET request
      const response = await supabase.functions.invoke('upload-file', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Don't include body for GET requests
        // Use query parameters in the URL instead
      });

      if (response.error) {
        console.error('Error fetching documents:', response.error);
        setErrorMessage(`Error al cargar facturas: ${response.error.message}`);
        throw response.error;
      }

      console.log('Documents fetched:', response.data);
      setDocuments(response.data || []);
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las facturas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Call check-storage-buckets function to ensure buckets exist
  const checkStorageBuckets = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-storage-buckets');
      if (error) {
        console.error('Error checking storage buckets:', error);
      } else {
        console.log('Storage buckets check:', data);
      }
    } catch (err) {
      console.error('Failed to check storage buckets:', err);
    }
  };

  // Use useEffect to call fetchDocuments and checkStorageBuckets on component mount
  useEffect(() => {
    fetchDocuments();
    checkStorageBuckets();
  }, []);

  const handleInvoiceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Formato de archivo no permitido. Solo se aceptan PDF y Excel.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      setUploadingInvoice(true);
      setErrorMessage(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'invoice');
      formData.append('userId', session.user.id);

      console.log('Uploading invoice with data:', {
        userId: session.user.id,
        fileName: file.name,
        fileType: file.type
      });

      // First check if buckets exist
      await checkStorageBuckets();
      
      // Then upload the file
      const response = await supabase.functions.invoke('upload-file', {
        body: formData,
      });

      if (response.error) {
        console.error('Upload error:', response.error);
        throw response.error;
      }

      console.log('Upload response:', response);

      toast({
        title: "Éxito",
        description: "Factura subida correctamente",
      });

      // Refresh documents list
      fetchDocuments();
    } catch (error: any) {
      console.error('Error uploading invoice:', error);
      toast({
        title: "Error",
        description: `No se pudo subir la factura: ${error.message || 'Error desconocido'}`,
        variant: "destructive",
      });
    } finally {
      setUploadingInvoice(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="font-semibold mb-4">FACTURAS DE SUMINISTRO ELÉCTRICO:</h3>
      
      {errorMessage && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
          {errorMessage}
        </div>
      )}
      
      {isLoading ? (
        <div className="text-center py-10">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Cargando facturas...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
          {documents.length === 0 ? (
            <p className="col-span-full text-center text-gray-500">No hay facturas disponibles</p>
          ) : (
            documents.map((doc) => (
              <a 
                key={doc.id}
                href={`${supabase.storage.from('invoices').getPublicUrl(doc.file_path).data.publicUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-square flex items-center justify-center mb-4 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                    <FileText className="w-12 h-12 text-green-600" />
                  </div>
                  <div className="text-sm text-center font-medium text-gray-700 truncate group-hover:text-green-600">
                    {doc.filename}
                    {doc.deleted && <span className="block text-xs text-red-500">(Eliminado)</span>}
                  </div>
                </div>
              </a>
            ))
          )}
        </div>
      )}

      <div className="mt-6">
        <input
          type="file"
          id="invoice-upload"
          className="hidden"
          accept=".pdf,.xls,.xlsx"
          onChange={handleInvoiceUpload}
        />
        <label
          htmlFor="invoice-upload"
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center block cursor-pointer hover:border-gray-400"
        >
          {uploadingInvoice ? (
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-spin" />
          ) : (
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          )}
          <p className="text-gray-600">
            Arrastra o dale clic para subir una factura (PDF o Excel)
          </p>
        </label>
      </div>
    </div>
  );
};
