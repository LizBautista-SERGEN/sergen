
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Upload, Trash2, Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const DocumentsTab = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("facturas");
  const [documents, setDocuments] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch documents on component mount and when active tab changes
  useEffect(() => {
    fetchDocuments(activeTab);
  }, [activeTab]);

  const fetchDocuments = async (type: string) => {
    try {
      setIsLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('No active session found');
        if (type === 'facturas') {
          setDocuments([]);
        } else if (type === 'contratos') {
          setContracts([]);
        }
        return;
      }

      // Convert tab type to document type for the API
      const documentType = type === 'facturas' ? 'invoice' : 'contract';
      
      // Create URL path with parameters
      const functionPath = `upload-file?userId=${session.user.id}&type=${documentType}`;
      
      const response = await supabase.functions.invoke(functionPath, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        }
      });

      if (response.error) {
        console.error(`Error fetching ${type}:`, response.error);
        throw response.error;
      }

      if (type === 'facturas') {
        setDocuments(response.data || []);
      } else if (type === 'contratos') {
        setContracts(response.data || []);
      }
    } catch (error: any) {
      console.error(`Error fetching ${type}:`, error);
      toast({
        title: "Error",
        description: `No se pudieron cargar los ${type}: ${error.message || 'Error desconocido'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
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
      formData.append('type', type === 'facturas' ? 'invoice' : 'contract');
      formData.append('userId', session.user.id);

      // Upload the file
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

      toast({
        title: "Éxito",
        description: "Archivo subido correctamente",
      });

      // Refresh documents list
      fetchDocuments(type);
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: `No se pudo subir el archivo: ${error.message || 'Error desconocido'}`,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, type: string) => {
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
        description: "Archivo eliminado correctamente",
      });

      // Refresh documents
      fetchDocuments(type);
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: `No se pudo eliminar el archivo: ${error.message || 'Error desconocido'}`,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="facturas">Facturas</TabsTrigger>
          <TabsTrigger value="contratos">Contratos</TabsTrigger>
        </TabsList>
        <TabsContent value="facturas">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="invoice-upload">Subir Nueva Factura</Label>
              <Input
                type="file"
                id="invoice-upload"
                className="hidden"
                accept=".pdf, .xls, .xlsx"
                onChange={(e) => handleFileUpload(e, "facturas")}
              />
              <Label
                htmlFor="invoice-upload"
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center block cursor-pointer hover:border-gray-400"
              >
                {uploading && activeTab === "facturas" ? (
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
              {isLoading && activeTab === "facturas" ? (
                <div className="text-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  <p>Cargando facturas...</p>
                </div>
              ) : documents.length === 0 ? (
                <p className="text-gray-500">No hay facturas disponibles</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {documents.map((doc) => (
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
                            onClick={() => handleDelete(doc.id, "facturas")}
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
        </TabsContent>
        <TabsContent value="contratos">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="contract-upload">Subir Nuevo Contrato</Label>
              <Input
                type="file"
                id="contract-upload"
                className="hidden"
                accept=".pdf, .xls, .xlsx"
                onChange={(e) => handleFileUpload(e, "contratos")}
              />
              <Label
                htmlFor="contract-upload"
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center block cursor-pointer hover:border-gray-400"
              >
                {uploading && activeTab === "contratos" ? (
                  <Loader2 className="w-6 h-6 mx-auto animate-spin" />
                ) : (
                  <Upload className="w-6 h-6 mx-auto" />
                )}
                <p className="text-gray-600">
                  Arrastra o da clic para subir un contrato (PDF, XLS, XLSX)
                </p>
              </Label>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Contratos Disponibles</h2>
              {isLoading && activeTab === "contratos" ? (
                <div className="text-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  <p>Cargando contratos...</p>
                </div>
              ) : contracts.length === 0 ? (
                <p className="text-gray-500">No hay contratos disponibles</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {contracts.map((doc) => (
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
                            href={`${supabase.storage.from('contracts').getPublicUrl(doc.file_path).data.publicUrl}`}
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
                            onClick={() => handleDelete(doc.id, "contratos")}
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentsTab;
