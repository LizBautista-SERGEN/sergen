
import { useDocumentManagement } from "@/hooks/useDocumentManagement";

export interface Report {
  id: string;
  filename: string;
  file_path: string;
}

export const useReports = () => {
  const {
    documents: reports,
    isLoading,
    uploading,
    deletingId,
    error,
    handleFileUpload,
    handleDelete,
    fetchDocuments,
    getBucketName
  } = useDocumentManagement('report');

  return {
    reports,
    isLoading,
    uploading,
    deletingId,
    error,
    handleFileUpload,
    handleDelete,
    fetchReports: fetchDocuments,
    getBucketName: () => getBucketName('report')
  };
};
