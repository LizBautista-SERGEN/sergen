
import { useState, useEffect, useCallback } from "react";
import { supabase, PROJECT_ID } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface Document {
  id: string;
  filename: string;
  file_path: string;
}

export type DocumentType = 'invoice' | 'contract' | 'report';

export const useDocumentManagement = (documentType: DocumentType) => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('No active session found');
        setDocuments([]);
        return;
      }

      const userId = session.user.id;
      
      console.log(`Fetching ${documentType}s for user: ${userId}`);

      // Construir URL con parámetros de consulta
      const functionUrl = `https://${PROJECT_ID}.supabase.co/functions/v1/upload-file?userId=${userId}&type=${documentType}`;
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
          console.error('Direct fetch error response:', errorText);
          throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`${documentType}s fetched successfully:`, data);
        setDocuments(data || []);
      } catch (fetchError: any) {
        console.error('Direct fetch error:', fetchError);
        throw fetchError;
      }
    } catch (error: any) {
      console.error(`Error fetching ${documentType}s:`, error);
      setError(error.message || 'Error desconocido');
      toast({
        description: `No se pudieron cargar los ${getDocumentTypeDisplay(documentType)}: ${error.message || 'Error desconocido'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [documentType, toast]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf'];
    if (documentType !== 'report') {
      allowedTypes.push('application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        description: `Formato de archivo no permitido. ${documentType === 'report' ? 'Solo se aceptan PDF.' : 'Solo se aceptan PDF, XLS y XLSX.'}`,
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
      formData.append('type', documentType);
      formData.append('userId', session.user.id);

      console.log(`Uploading ${documentType} file:`, file.name);

      // Upload the file
      const response = await fetch(`https://${PROJECT_ID}.supabase.co/functions/v1/upload-file`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response from upload-file function:', errorText);
        throw new Error(`Error en la subida: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`${documentType} uploaded successfully:`, data);

      toast({
        description: `${getDocumentTypeDisplay(documentType, true)} subido correctamente`,
      });

      // Refresh documents list
      fetchDocuments();
    } catch (error: any) {
      console.error(`Error uploading ${documentType}:`, error);
      toast({
        description: `No se pudo subir el ${getDocumentTypeDisplay(documentType)}: ${error.message || 'Error desconocido'}`,
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

      console.log(`Deleting ${documentType} with ID:`, id);

      // Use the edge function to mark document as deleted
      const functionUrl = `https://${PROJECT_ID}.supabase.co/functions/v1/upload-file?id=${id}`;
      const response = await fetch(functionUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error en la eliminación: ${response.status} ${errorText}`);
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error("Error al eliminar el documento");
      }

      toast({
        description: `${getDocumentTypeDisplay(documentType, true)} eliminado correctamente`,
      });

      // Refresh documents
      fetchDocuments();
    } catch (error: any) {
      console.error(`Error deleting ${documentType}:`, error);
      toast({
        description: `No se pudo eliminar el ${getDocumentTypeDisplay(documentType)}: ${error.message || 'Error desconocido'}`,
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Helper function to get the appropriate display name for document type
  const getDocumentTypeDisplay = (type: DocumentType, singular: boolean = false): string => {
    switch(type) {
      case 'invoice':
        return singular ? 'la factura' : 'las facturas';
      case 'contract':
        return singular ? 'el contrato' : 'los contratos';
      case 'report':
        return singular ? 'el reporte' : 'los reportes';
      default:
        return singular ? 'el documento' : 'los documentos';
    }
  };

  // Helper function to get the bucket name based on document type
  const getBucketName = (type: DocumentType): string => {
    switch(type) {
      case 'invoice':
        return 'invoices';
      case 'contract':
        return 'contracts';
      case 'report':
        return 'reports';
      default:
        return 'documents';
    }
  };

  return {
    documents,
    isLoading,
    uploading,
    deletingId,
    error,
    handleFileUpload,
    handleDelete,
    fetchDocuments,
    getBucketName,
    getDocumentTypeDisplay
  };
};
