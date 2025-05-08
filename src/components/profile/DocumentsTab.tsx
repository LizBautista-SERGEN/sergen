
import { useState, useEffect } from "react";
import { FileText, Upload, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export const DocumentsTab = () => {
  const { toast } = useToast();
  const { profile } = useUserProfile();
  const [uploadingInvoice, setUploadingInvoice] = useState(false);
  const [uploadingContract, setUploadingContract] = useState(false);
  const [uploadingReport, setUploadingReport] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [isLoadingContracts, setIsLoadingContracts] = useState(false);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDocuments = async (type: 'invoice' | 'contract' | 'report') => {
    const loadingStateSetter = type === 'invoice' 
      ? setIsLoadingInvoices 
      : type === 'contract' 
        ? setIsLoadingContracts
        : setIsLoadingReports;
    
    const documentsSetter = type === 'invoice' 
      ? setInvoices 
      : type === 'contract' 
        ? setContracts
        : setReports;

    try {
      loadingStateSetter(true);
      setErrorMessage(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('No active session found');
        documentsSetter([]);
        return;
      }

      console.log(`Fetching ${type} documents for user:`, session.user.id);

      // Using URL parameters for GET request
      const response = await supabase.functions.invoke('upload-file', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        query: {
          userId: session.user.id,
          type: type
        }
      });

      if (response.error) {
        console.error(`Error fetching ${type} documents:`, response.error);
        setErrorMessage(`Error al cargar documentos: ${response.error.message}`);
        throw response.error;
      }

      console.log(`${type.charAt(0).toUpperCase() + type.slice(1)}s fetched:`, response.data);
      documentsSetter(response.data || []);
    } catch (error: any) {
      console.error(`Error fetching ${type} documents:`, error);
      toast({
        title: "Error",
        description: `No se pudieron cargar los documentos: ${error.message || 'Error desconocido'}`,
        variant: "destructive",
      });
    } finally {
      loadingStateSetter(false);
    }
  };

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

  useEffect(() => {
    checkStorageBuckets();
    fetchDocuments('invoice');
    fetchDocuments('contract');
    fetchDocuments('report');
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'invoice' | 'contract' | 'report') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Define allowed MIME types based on document type
    let allowedTypes: string[];
    if (type === 'invoice') {
      allowedTypes = ['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    } else {
      allowedTypes = ['application/pdf'];
    }
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: type === 'invoice' 
          ? "Formato de archivo no permitido. Solo se aceptan PDF y Excel."
          : "Formato de archivo no permitido. Solo se aceptan PDF.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      if (type === 'invoice') setUploadingInvoice(true);
      else if (type === 'contract') setUploadingContract(true);
      else setUploadingReport(true);
      
      setErrorMessage(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('userId', session.user.id);

      console.log(`Uploading ${type} with data:`, {
        userId: session.user.id,
        fileName: file.name,
        fileType: file.type
      });

      // First check if buckets exist
      await checkStorageBuckets();
      
      // Then upload the file
      const { data, error } = await supabase.functions.invoke('upload-file', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData,
      });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      console.log('Upload response:', data);

      toast({
        title: "Éxito",
        description: `${type === 'invoice' ? 'Factura' : type === 'contract' ? 'Contrato' : 'Reporte'} subido correctamente`,
      });

      // Refresh documents list
      fetchDocuments(type);
    } catch (error: any) {
      console.error(`Error uploading ${type}:`, error);
      toast({
        title: "Error",
        description: `No se pudo subir el ${type === 'invoice' ? 'la factura' : type === 'contract' ? 'el contrato' : 'el reporte'}: ${error.message || 'Error desconocido'}`,
        variant: "destructive",
      });
    } finally {
      if (type === 'invoice') setUploadingInvoice(false);
      else if (type === 'contract') setUploadingContract(false);
      else setUploadingReport(false);
    }
  };

  const handleDelete = async (id: string, type: 'invoice' | 'contract' | 'report') => {
    try {
      setDeletingId(id);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const { error } = await supabase
        .from('documents')
        .update({ deleted: true })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Documento eliminado correctamente",
      });

      // Refresh documents after deletion
      fetchDocuments(type);
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: `No se pudo eliminar el documento: ${error.message || 'Error desconocido'}`,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const renderDocumentSection = (documents: any[], isLoading: boolean, type: 'invoice' | 'contract' | 'report', uploading: boolean) => {
    const bucketName = type === 'invoice' ? 'invoices' : type === 'contract' ? 'contracts' : 'reports';
    const acceptTypes = type === 'invoice' ? '.pdf,.xls,.xlsx' : '.pdf';
    const uploadText = type === 'invoice' 
      ? 'Arrastra o dale clic para subir una factura (PDF o Excel)'
      : type === 'contract'
        ? 'Arrastra o dale clic para subir un contrato o adenda (PDF)'
        : 'Arrastra o dale clic para subir un reporte (PDF)';
    
    return (
      <div className="space-y-6">
        {errorMessage && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
            {errorMessage}
          </div>
        )}
        
        {isLoading ? (
          <div className="text-center py-10">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Cargando documentos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
            {documents.length === 0 ? (
              <p className="col-span-full text-center text-gray-500">No hay documentos disponibles</p>
            ) : (
              documents.map((doc) => (
                <div key={doc.id} className="relative group">
                  <a 
                    href={`${supabase.storage.from(bucketName).getPublicUrl(doc.file_path).data.publicUrl}`}
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
                      </div>
                    </div>
                  </a>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 rounded-full h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(doc.id, type)}
                    disabled={deletingId === doc.id}
                  >
                    {deletingId === doc.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))
            )}
          </div>
        )}

        <div className="mt-6">
          <input
            type="file"
            id={`${type}-upload`}
            className="hidden"
            accept={acceptTypes}
            onChange={(e) => handleFileUpload(e, type)}
          />
          <label
            htmlFor={`${type}-upload`}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center block cursor-pointer hover:border-gray-400"
          >
            {uploading ? (
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-spin" />
            ) : (
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            )}
            <p className="text-gray-600">{uploadText}</p>
          </label>
        </div>
      </div>
    );
  };

  return (
    <Tabs defaultValue="facturas" className="w-full">
      <TabsList>
        <TabsTrigger value="facturas">Facturas</TabsTrigger>
        <TabsTrigger value="contratos">Contratos y Adendas</TabsTrigger>
        <TabsTrigger value="reportes">Reportes</TabsTrigger>
      </TabsList>
      
      <TabsContent value="facturas" className="mt-6">
        <h3 className="font-semibold mb-4">FACTURAS DE SUMINISTRO ELÉCTRICO:</h3>
        {renderDocumentSection(invoices, isLoadingInvoices, 'invoice', uploadingInvoice)}
      </TabsContent>
      
      <TabsContent value="contratos" className="mt-6">
        <h3 className="font-semibold mb-4">CONTRATOS Y ADENDAS:</h3>
        {renderDocumentSection(contracts, isLoadingContracts, 'contract', uploadingContract)}
      </TabsContent>
      
      <TabsContent value="reportes" className="mt-6">
        <h3 className="font-semibold mb-4">REPORTES:</h3>
        {renderDocumentSection(reports, isLoadingReports, 'report', uploadingReport)}
      </TabsContent>
    </Tabs>
  );
};
