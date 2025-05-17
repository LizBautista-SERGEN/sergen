
import { useDocumentManagement } from "@/hooks/useDocumentManagement";
import type { Document } from "@/hooks/useDocumentManagement";

export interface Report extends Document {
  id: string;
  filename: string;
  file_path: string;
}

export const useReports = () => {
  const {
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
  } = useDocumentManagement('report');

  return {
    reports: documents as Report[],
    isLoading,
    uploading,
    deletingId,
    error,
    handleFileUpload,
    handleDelete,
    fetchReports: fetchDocuments,
    getBucketName: () => getBucketName('report'),
    getDocumentTypeDisplay: () => getDocumentTypeDisplay('report')
  };
};
