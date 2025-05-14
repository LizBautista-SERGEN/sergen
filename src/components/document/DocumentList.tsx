
import { FileText, Download, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Document } from "@/hooks/useDocumentManagement";

interface DocumentListProps {
  documents: Document[];
  bucketName: string;
  isLoading: boolean;
  deletingId: string | null;
  onDelete: (id: string) => void;
  emptyMessage?: string;
}

export const DocumentList = ({
  documents,
  bucketName,
  isLoading,
  deletingId,
  onDelete,
  emptyMessage = "No hay documentos disponibles"
}: DocumentListProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-4">
        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
        <p>Cargando documentos...</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return <p className="text-gray-500">{emptyMessage}</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {documents.map((doc) => (
        <div key={doc.id} className="relative group">
          <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="aspect-square flex items-center justify-center mb-2 bg-blue-50 rounded-lg">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-sm font-medium text-center text-gray-700 truncate mb-3">
              {doc.filename}
            </div>
            <div className="flex justify-center gap-2">
              <a
                href={`${supabase.storage.from(bucketName).getPublicUrl(doc.file_path).data.publicUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                download
              >
                <Button size="sm" variant="outline" className="w-full flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  Descargar
                </Button>
              </a>
              <Button 
                size="sm" 
                variant="destructive"
                className="flex items-center gap-1"
                onClick={() => onDelete(doc.id)}
                disabled={deletingId === doc.id}
              >
                {deletingId === doc.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
