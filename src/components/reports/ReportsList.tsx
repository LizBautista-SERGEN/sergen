
import { FC } from "react";
import { Card } from "@/components/ui/card";
import { FileText, Loader2, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Report {
  id: string;
  filename: string;
  file_path: string;
}

interface ReportsListProps {
  reports: any[];
  isLoading: boolean;
  deletingId: string | null;
  onDelete: (id: string) => Promise<void>;
}

export const ReportsList: FC<ReportsListProps> = ({ reports, isLoading, deletingId, onDelete }) => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Reportes Disponibles</h2>
      
      {isLoading ? (
        <div className="text-center py-10">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Cargando reportes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {reports.length === 0 ? (
            <p className="col-span-full text-center text-gray-500 py-8">No hay reportes disponibles</p>
          ) : (
            reports.map((doc) => (
              <div key={doc.id} className="relative group">
                <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="aspect-square flex items-center justify-center mb-4 bg-blue-50 rounded-lg">
                    <FileText className="w-12 h-12 text-blue-600" />
                  </div>
                  
                  <div className="text-sm font-medium text-center text-gray-700 truncate mb-3">
                    {doc.filename}
                  </div>
                  
                  <div className="flex justify-center gap-2">
                    <a 
                      href={`${supabase.storage.from('reports').getPublicUrl(doc.file_path).data.publicUrl}`}
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
            ))
          )}
        </div>
      )}
    </Card>
  );
};
