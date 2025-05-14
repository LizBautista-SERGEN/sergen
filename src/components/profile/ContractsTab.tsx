
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Upload, Trash2, Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const ContractsTab = () => {
  const { toast } = useToast();
  const [contracts, setContracts] = useState<any[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch contracts on component mount
  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('No active session found');
        setContracts([]);
        return;
      }

      const userId = session.user.id;
      
      console.log(`Fetching contracts for user: ${userId}`);
      console.log('Session access token length:', session.access_token.length);
      console.log('Session access token first 10 chars:', session.access_token.substring(0, 10));

      // Construct the Edge Function URL using string template
      const projectId = supabase.supabaseUrl.split('https://')[1].split('.')[0];
      const functionUrl = `https://${projectId}.supabase.co/functions/v1/upload-file`;
      console.log('Edge Function URL:', functionUrl);

      try {
        // Direct fetch attempt for debugging
        const fetchResponse = await fetch(functionUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ userId, type: 'contract' })
        });
        
        console.log('Direct fetch status:', fetchResponse.status);
        console.log('Direct fetch status text:', fetchResponse.statusText);
        
        if (!fetchResponse.ok) {
          const errorText = await fetchResponse.text();
          console.error('Direct fetch error response:', errorText);
        }
      } catch (fetchError) {
        console.error('Direct fetch error:', fetchError);
      }

      console.log('Attempting supabase.functions.invoke call...');
      
      const { data, error } = await supabase.functions.invoke('upload-file', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: { userId, type: 'contract' },
      });

      if (error) {
        console.error('Error details:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Error status:', error.status);
        
        if (error.message && error.message.includes('JWT')) {
          console.error('Possible JWT/Authentication issue detected');
          
          // Try refreshing the session
          console.log('Attempting to refresh session...');
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError) {
            console.error('Session refresh failed:', refreshError);
            throw error;
          } else {
            console.log('Session refreshed successfully, retrying fetch...');
            // Retry with the new session
            const { data: retriedData, error: retriedError } = await supabase.functions.invoke('upload-file', {
              method: 'GET',
              body: { userId, type: 'contract' },
            });
            
            if (retriedError) {
              console.error('Retry after session refresh failed:', retriedError);
              throw retriedError;
            }
            
            console.log('Retry successful:', retriedData);
            setContracts(retriedData || []);
            return;
          }
        }
        
        throw error;
      }

      console.log('Contracts fetched successfully:', data);
      setContracts(data || []);
    } catch (error: any) {
      console.error(`Error fetching contracts:`, error);
      setError(error.message || 'Error desconocido');
      toast({
        description: `No se pudieron cargar los contratos: ${error.message || 'Error desconocido'}`,
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
      formData.append('type', 'contract');
      formData.append('userId', session.user.id);

      console.log('Uploading contract file:', file.name);

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

      console.log('Contract uploaded successfully:', data);

      toast({
        title: "Éxito",
        description: "Contrato subido correctamente",
      });

      // Refresh contracts list
      fetchContracts();
    } catch (error: any) {
      console.error('Error uploading contract:', error);
      toast({
        title: "Error",
        description: `No se pudo subir el contrato: ${error.message || 'Error desconocido'}`,
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

      console.log('Deleting contract with ID:', id);

      const { error } = await supabase
        .from('documents')
        .update({ deleted: true })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Contrato eliminado correctamente",
      });

      // Refresh contracts
      fetchContracts();
    } catch (error: any) {
      console.error('Error deleting contract:', error);
      toast({
        title: "Error",
        description: `No se pudo eliminar el contrato: ${error.message || 'Error desconocido'}`,
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
            <p className="font-semibold">Error al cargar contratos:</p>
            <p className="text-sm mt-1">{error}</p>
            <Button 
              onClick={fetchContracts} 
              variant="outline" 
              size="sm"
              className="mt-2"
            >
              Reintentar
            </Button>
          </div>
        )}
        
        <div>
          <Label htmlFor="contract-upload">Subir Nuevo Contrato o Adenda</Label>
          <Input
            type="file"
            id="contract-upload"
            className="hidden"
            accept=".pdf, .xls, .xlsx"
            onChange={handleFileUpload}
          />
          <Label
            htmlFor="contract-upload"
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center block cursor-pointer hover:border-gray-400 mt-2"
          >
            {uploading ? (
              <Loader2 className="w-6 h-6 mx-auto animate-spin" />
            ) : (
              <Upload className="w-6 h-6 mx-auto" />
            )}
            <p className="text-gray-600">
              Arrastra o da clic para subir un contrato o adenda (PDF, XLS, XLSX)
            </p>
          </Label>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Contratos y Adendas Disponibles</h2>
          {isLoading ? (
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

export default ContractsTab;
