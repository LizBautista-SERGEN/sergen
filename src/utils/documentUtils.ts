
import { DocumentType } from "@/types/documents";

// Helper function to get the appropriate display name for document type
export const getDocumentTypeDisplay = (type: DocumentType, singular: boolean = false): string => {
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
export const getBucketName = (type: DocumentType): string => {
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
