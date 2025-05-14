
import { useDocumentManagement } from "@/hooks/useDocumentManagement";
import { DocumentList } from "@/components/document/DocumentList";
import { DocumentUploader } from "@/components/document/DocumentUploader";
import { ErrorAlert } from "@/components/document/ErrorAlert";

const ContractsTab = () => {
  const {
    documents: contracts,
    isLoading,
    uploading,
    deletingId,
    error,
    handleFileUpload,
    handleDelete,
    fetchDocuments,
    getBucketName
  } = useDocumentManagement('contract');

  return (
    <div>
      <div className="grid gap-4">
        <ErrorAlert message={error} onRetry={fetchDocuments} />
        
        <DocumentUploader
          id="contract-upload"
          label="Subir Nuevo Contrato o Adenda"
          accept=".pdf, .xls, .xlsx"
          isUploading={uploading}
          onUpload={handleFileUpload}
          description="Arrastra o da clic para subir un contrato o adenda (PDF, XLS, XLSX)"
        />

        <div>
          <h2 className="text-xl font-semibold mb-2">Contratos y Adendas Disponibles</h2>
          <DocumentList
            documents={contracts}
            bucketName={getBucketName('contract')}
            isLoading={isLoading}
            deletingId={deletingId}
            onDelete={handleDelete}
            emptyMessage="No hay contratos disponibles"
          />
        </div>
      </div>
    </div>
  );
};

export default ContractsTab;
