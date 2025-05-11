
import { useEffect, useState } from "react";
import { Upload, Download, FileText, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/hooks/useUserProfile";

const ReportsPage = () => {
  const { toast } = useToast();
  const { profile } = useUserProfile();
  const [uploading, setUploading] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('No active session found');
        setReports([]);
        return;
      }

      const userId = session.user.id;
      
      console.log(`Fetching reports for user: ${userId}`);

      // Usar URLSearchParams para GET
      const url = new URL(`${supabase.functions.url('upload-file')}`);
      url.searchParams.append('userId', userId);
      url.searchParams.append('type', 'report');

      const { data, error } = await supabase.functions.invoke('upload-file', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        query: {
          userId,
          type: 'report'
        }
      });

      if (error) {
        console.error('Error fetching reports:', error);
        throw error;
      }

      console.log('Reports fetched successfully:', data);
      setReports(data || []);
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error",
        description: `No se pudieron cargar los reportes: ${error.message || 'Error desconocido'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf'];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Formato de archivo no permitido. Solo se aceptan PDF.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      setUploading(true);

      // Crear FormData para la subida
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'report');
      formData.append('userId', session.user.id);

      console.log('Uploading report file:', file.name);

      // Corrección: Asegurar que se use el FormData correctamente
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

      console.log('Report uploaded successfully:', data);

      toast({
        title: "Éxito",
        description: "Reporte subido correctamente",
      });

      // Refresh reports list
      await fetchReports();
    } catch (error: any) {
      console.error('Error uploading report:', error);
      toast({
        title: "Error",
        description: `No se pudo subir el reporte: ${error.message || 'Error desconocido'}`,
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

      console.log('Deleting report with ID:', id);

      const { error } = await supabase
        .from('documents')
        .update({ deleted: true })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Reporte eliminado correctamente",
      });

      // Refresh reports
      await fetchReports();
    } catch (error: any) {
      console.error('Error deleting report:', error);
      toast({
        title: "Error",
        description: `No se pudo eliminar el reporte: ${error.message || 'Error desconocido'}`,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Reportes</h1>
      
      <Card className="p-6 mb-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Subir Nuevo Reporte</h2>
          <div>
            <input
              type="file"
              id="report-upload"
              className="hidden"
              accept=".pdf"
              onChange={handleFileUpload}
            />
            <label
              htmlFor="report-upload"
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center block cursor-pointer hover:border-gray-400"
            >
              {uploading ? (
                <Loader2 className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-spin" />
              ) : (
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              )}
              <p className="text-gray-600">Arrastra o dale clic para subir un reporte (PDF)</p>
            </label>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Reportes Disponibles</h2>
        
        {isLoading ? (
          <div className="text-center py-10">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Cargando reportes...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {reports.length === 0 ? (
              <p className="col-span-full text-center text-gray-500 py-8">No hay reportes disponibles</p>
            ) : (
              reports.map((doc) => (
                <div key={doc.id} className="relative group">
                  <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="aspect-square flex items-center justify-center mb-4 bg-blue-50 rounded-lg">
                      <FileText className="w-12 h-12 text-blue-600" />
                    </div>
                    
                    <div className="text-sm font-medium text-center text-gray-700 truncate mb-3">
                      {doc.filename}
                    </div>
                    
                    <div className="flex justify-center gap-2">
                      <a 
                        href={`${supabase.storage.from('reports').getPublicUrl(doc.file_path).data.publicUrl}`}
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
              ))
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ReportsPage;
