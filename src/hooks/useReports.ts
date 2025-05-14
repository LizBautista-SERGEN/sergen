
import { useState, useEffect } from "react";
import { supabase, PROJECT_ID } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface Report {
  id: string;
  filename: string;
  file_path: string;
}

export const useReports = () => {
  const [uploading, setUploading] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('No active session found');
        setReports([]);
        return;
      }

      const userId = session.user.id;
      
      console.log(`Fetching reports for user: ${userId}`);

      // Construir URL con parámetros de consulta
      const functionUrl = `https://${PROJECT_ID}.supabase.co/functions/v1/upload-file?userId=${userId}&type=report`;
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
        console.log('Reports fetched successfully:', data);
        setReports(data || []);
      } catch (fetchError: any) {
        console.error('Direct fetch error:', fetchError);
        throw fetchError;
      }
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      setError(error.message || 'Error desconocido');
      toast({
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
        description: "Formato de archivo no permitido. Solo se aceptan PDF.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      setUploading(true);

      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'report');
      formData.append('userId', session.user.id);

      console.log('Uploading report file:', file.name);

      // Usar fetch directamente
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
      console.log('Report uploaded successfully:', data);

      toast({
        description: "Reporte subido correctamente",
      });

      // Refresh reports list
      await fetchReports();
    } catch (error: any) {
      console.error('Error uploading report:', error);
      toast({
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
        description: "Reporte eliminado correctamente",
      });

      // Refresh reports
      await fetchReports();
    } catch (error: any) {
      console.error('Error deleting report:', error);
      toast({
        description: `No se pudo eliminar el reporte: ${error.message || 'Error desconocido'}`,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return {
    reports,
    isLoading,
    uploading,
    deletingId,
    error,
    handleFileUpload,
    handleDelete,
    fetchReports
  };
};
