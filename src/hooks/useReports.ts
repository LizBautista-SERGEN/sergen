
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface Report {
  id: string;
  filename: string;
  file_path: string;
}

export const useReports = () => {
  const [uploading, setUploading] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
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
      console.log('Session access token length:', session.access_token.length);
      console.log('Session access token first 10 chars:', session.access_token.substring(0, 10));

      // Log the Edge Function URL for debugging
      const functionUrl = `${supabase.functions.getUrl('upload-file')}`;
      console.log('Edge Function URL:', functionUrl);

      try {
        // Direct fetch attempt for debugging
        const fetchResponse = await fetch(functionUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ userId, type: 'report' })
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

      const { data, error } = await supabase.functions.invoke('upload-file', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: { userId, type: 'report' }
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
              body: { userId, type: 'report' },
            });
            
            if (retriedError) {
              console.error('Retry after session refresh failed:', retriedError);
              throw retriedError;
            }
            
            console.log('Retry successful:', retriedData);
            setReports(retriedData || []);
            return;
          }
        }
        
        throw error;
      }

      console.log('Reports fetched successfully:', data);
      setReports(data || []);
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

      // Use supabase.functions.invoke with FormData
      const { data, error } = await supabase.functions.invoke('upload-file', {
        method: 'POST',
        body: formData
      });
      
      if (error) {
        throw error;
      }

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
