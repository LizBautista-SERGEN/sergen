
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { toast } from "sonner";

interface UploadEnergyDataProps {
  onUploadSuccess: () => void;
}

export const UploadEnergyData = ({ onUploadSuccess }: UploadEnergyDataProps) => {
  const [loading, setLoading] = useState(false);

  const handleUploadEnergyData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar el tamaño del archivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('El archivo es demasiado grande. El tamaño máximo es 5MB');
      return;
    }

    // Validar el tipo de archivo
    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'];
    if (!validTypes.includes(file.type)) {
      toast.error('Formato de archivo no válido. Por favor, use Excel (.xlsx, .xls) o CSV');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No hay sesión activa');
      }

      console.log('Iniciando carga de archivo para usuario:', session.user.id);

      const { error } = await supabase.functions.invoke('upload-energy-data', {
        body: formData,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        responseType: 'json'
      });

      if (error) throw error;

      toast.success('Datos subidos exitosamente');
      
      // Esperamos un momento antes de recargar los datos
      setTimeout(() => {
        onUploadSuccess();
      }, 1000);
      
    } catch (error: any) {
      console.error('Error al subir archivo:', error);
      
      // Mensajes de error más específicos
      if (error.message?.includes('Failed to fetch')) {
        toast.error('Error de conexión. Por favor, inténtelo de nuevo');
      } else if (error.message?.includes('WORKER_LIMIT')) {
        toast.error('El archivo es demasiado grande para procesar. Por favor, intente con un archivo más pequeño');
      } else {
        toast.error(error.message || 'Error al subir datos');
      }
    } finally {
      setLoading(false);
      // Limpiar el input file
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subir Datos de Energía</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleUploadEnergyData}
            className="hidden"
            id="energy-data-upload"
            disabled={loading}
          />
          <Label
            htmlFor="energy-data-upload"
            className={`cursor-pointer flex flex-col items-center ${loading ? 'opacity-50' : ''}`}
          >
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <span className="text-gray-600">
              {loading ? 'Subiendo archivo...' : 'Click para subir archivo de datos de energía'}
            </span>
            <span className="text-sm text-gray-500 mt-2">
              Formatos aceptados: Excel (.xlsx, .xls) o CSV. Máximo 5MB
            </span>
          </Label>
        </div>
      </CardContent>
    </Card>
  );
};
