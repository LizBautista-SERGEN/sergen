
import { useDocumentManagement } from "@/hooks/useDocumentManagement";
import { DocumentList } from "@/components/document/DocumentList";
import { DocumentUploader } from "@/components/document/DocumentUploader";
import { ErrorAlert } from "@/components/document/ErrorAlert";

const InvoicesTab = () => {
  const {
    documents: invoices,
    isLoading,
    uploading,
    deletingId,
    error,
    handleFileUpload,
    handleDelete,
    fetchDocuments,
    getBucketName
  } = useDocumentManagement('invoice');

  return (
    <div>
      <div className="grid gap-4">
        <ErrorAlert message={error} onRetry={fetchDocuments} />

        <DocumentUploader
          id="invoice-upload"
          label="Subir Nueva Factura"
          accept=".pdf, .xls, .xlsx"
          isUploading={uploading}
          onUpload={handleFileUpload}
          description="Arrastra o da clic para subir una factura (PDF, XLS, XLSX)"
        />

        <div>
          <h2 className="text-xl font-semibold mb-2">Facturas Disponibles</h2>
          <DocumentList
            documents={invoices}
            bucketName={getBucketName('invoice')}
            isLoading={isLoading}
            deletingId={deletingId}
            onDelete={handleDelete}
            emptyMessage="No hay facturas disponibles"
          />
        </div>
      </div>
    </div>
  );
};

export default InvoicesTab;
