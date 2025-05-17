
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { fetchDocuments, uploadDocument, deleteDocument } from "@/services/documentService";
import { getBucketName, getDocumentTypeDisplay } from "@/utils/documentUtils";
import { Document, DocumentType } from "@/types/documents";

// Re-export types with the proper "export type" syntax
export type { Document, DocumentType } from "@/types/documents";

export const useDocumentManagement = (documentType: DocumentType) => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch documents on component mount
  useEffect(() => {
    fetchDocumentsList();
  }, []);

  const fetchDocumentsList = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const fetchedDocuments = await fetchDocuments(documentType);
      setDocuments(fetchedDocuments);
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
      setUploading(true);

      await uploadDocument(documentType, file);
      
      toast({
        description: `${getDocumentTypeDisplay(documentType, true)} subido correctamente`,
      });

      // Refresh documents list
      fetchDocumentsList();
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
      
      await deleteDocument(id);

      toast({
        description: `${getDocumentTypeDisplay(documentType, true)} eliminado correctamente`,
      });

      // Refresh documents
      fetchDocumentsList();
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

  return {
    documents,
    isLoading,
    uploading,
    deletingId,
    error,
    handleFileUpload,
    handleDelete,
    fetchDocuments: fetchDocumentsList,
    getBucketName,
    getDocumentTypeDisplay
  };
};
