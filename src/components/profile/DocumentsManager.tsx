
import { useState } from "react";
import { FileText, Upload, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DocumentsManagerProps {
  documents: any[];
  profile: any;
  onDocumentsUpdate: () => void;
}

export const DocumentsManager = ({ documents, profile, onDocumentsUpdate }: DocumentsManagerProps) => {
  const { toast } = useToast();
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [deletingDocument, setDeletingDocument] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'contract' | 'invoice') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf'];
    if (type === 'invoice') {
      allowedTypes.push('application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Formato de archivo no permitido",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      setUploadingDocument(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('userId', session.user.id);

      const { error } = await supabase.functions.invoke('upload-file', {
        body: formData,
      });

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Archivo subido correctamente",
      });

      onDocumentsUpdate();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "No se pudo subir el archivo",
        variant: "destructive",
      });
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      setDeletingDocument(documentId);

      const { error } = await supabase
        .from('documents')
        .update({ deleted: true })
        .eq('id', documentId);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Documento eliminado correctamente",
      });

      onDocumentsUpdate();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el documento",
        variant: "destructive",
      });
    } finally {
      setDeletingDocument(null);
    }
  };

  const renderDocumentSection = (type: 'contract' | 'invoice') => {
    const title = type === 'contract' ? 'CONTRATOS Y ADENDAS' : 'FACTURA DE SUMINISTRO ELÉCTRICO';
    const storageBucket = type === 'contract' ? 'contracts' : 'invoices';
    const acceptTypes = type === 'contract' ? '.pdf' : '.pdf,.xls,.xlsx';
    const uploadText = type === 'contract' 
      ? 'Arrastra o dale clic para subir un contrato (PDF)'
      : 'Arrastra o dale clic para subir una factura (PDF o Excel)';
    const bgColorClass = type === 'contract' ? 'bg-blue-50' : 'bg-green-50';
    const hoverBgColorClass = type === 'contract' ? 'group-hover:bg-blue-100' : 'group-hover:bg-green-100';
    const textColorClass = type === 'contract' ? 'text-blue-600' : 'text-green-600';
    const hoverTextColorClass = type === 'contract' ? 'group-hover:text-blue-600' : 'group-hover:text-green-600';

    const filteredDocs = documents.filter(doc => 
      doc.document_type === type && (!doc.deleted || profile?.role === 'superuser')
    );

    return (
      <div>
        <h3 className="font-semibold mb-4">{title}:</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredDocs.map((doc) => (
            <div key={doc.id} className="group relative">
              <a 
                href={`${supabase.storage.from(storageBucket).getPublicUrl(doc.file_path).data.publicUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className={`bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow ${doc.deleted ? 'opacity-50' : ''}`}>
                  <div className={`aspect-square flex items-center justify-center mb-4 ${bgColorClass} rounded-lg ${hoverBgColorClass} transition-colors`}>
                    <FileText className={`w-12 h-12 ${textColorClass}`} />
                  </div>
                  <div className={`text-sm text-center font-medium text-gray-700 truncate ${hoverTextColorClass}`}>
                    {doc.filename}
                    {doc.deleted && <span className="block text-xs text-red-500">(Eliminado)</span>}
                  </div>
                </div>
              </a>
              {!doc.deleted && (
                <button
                  onClick={() => handleDeleteDocument(doc.id)}
                  className="absolute -top-2 -right-2 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
                  disabled={deletingDocument === doc.id}
                >
                  {deletingDocument === doc.id ? (
                    <Loader2 className="w-4 h-4 text-red-600 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 text-red-600" />
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-6">
          <input
            type="file"
            id={`${type}-upload`}
            className="hidden"
            accept={acceptTypes}
            onChange={(e) => handleFileUpload(e, type)}
          />
          <label
            htmlFor={`${type}-upload`}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center block cursor-pointer hover:border-gray-400"
          >
            {uploadingDocument ? (
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-spin" />
            ) : (
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            )}
            <p className="text-gray-600">{uploadText}</p>
          </label>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {renderDocumentSection('contract')}
      {renderDocumentSection('invoice')}
    </div>
  );
};
