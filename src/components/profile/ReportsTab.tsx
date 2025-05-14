
import { useReports } from "@/hooks/useReports";
import { DocumentList } from "@/components/document/DocumentList";
import { DocumentUploader } from "@/components/document/DocumentUploader";
import { ErrorAlert } from "@/components/document/ErrorAlert";

const ReportsTab = () => {
  const {
    reports,
    isLoading,
    uploading,
    deletingId,
    error,
    handleFileUpload,
    handleDelete,
    fetchReports,
    getBucketName
  } = useReports();

  return (
    <div>
      <div className="grid gap-4">
        <ErrorAlert message={error} onRetry={fetchReports} />
        
        <DocumentUploader
          id="report-upload"
          label="Subir Nuevo Reporte"
          accept=".pdf"
          isUploading={uploading}
          onUpload={handleFileUpload}
          description="Arrastra o da clic para subir un reporte (Solo PDF)"
        />

        <div>
          <h2 className="text-xl font-semibold mb-2">Reportes Disponibles</h2>
          <DocumentList
            documents={reports}
            bucketName={getBucketName()}
            isLoading={isLoading}
            deletingId={deletingId}
            onDelete={handleDelete}
            emptyMessage="No hay reportes disponibles"
          />
        </div>
      </div>
    </div>
  );
};

export default ReportsTab;
