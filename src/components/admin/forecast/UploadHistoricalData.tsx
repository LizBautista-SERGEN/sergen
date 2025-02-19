
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useQueryClient } from "@tanstack/react-query";

export const UploadHistoricalData = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { isSuperUser } = useUserProfile();
  const queryClient = useQueryClient();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Por favor selecciona un archivo Excel (.xlsx o .xls)');
      return;
    }

    try {
      setIsUploading(true);
      
      // Convert file to base64
      const base64File = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      console.log('Enviando archivo:', file.name);

      // Primero, eliminar todos los datos existentes
      const { error: deleteError } = await supabase
        .from('coes_historical')
        .delete()
        .not('id', 'is', null); // Esto eliminará todos los registros

      if (deleteError) {
        console.error('Error al eliminar datos existentes:', deleteError);
        throw new Error('Error al eliminar datos existentes');
      }

      // Luego, proceder con la carga del nuevo archivo
      const { data, error } = await supabase.functions.invoke('upload-historical-data', {
        body: {
          fileName: file.name,
          fileContent: base64File,
          contentType: file.type
        }
      });

      if (error) {
        console.error('Error al subir archivo:', error);
        throw error;
      }

      console.log('Respuesta:', data);
      toast.success('Datos históricos actualizados correctamente');
      
      // Invalidar la consulta para forzar una actualización de los datos
      await queryClient.invalidateQueries({
        queryKey: ['historical-data']
      });
      
      // Limpiar el input file
      event.target.value = '';
      
    } catch (error: any) {
      console.error('Error al subir archivo:', error);
      toast.error('Error al procesar el archivo: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isSuperUser) return null;

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h3 className="font-semibold mb-2">Subir Datos Históricos</h3>
      <div className="flex items-center gap-2">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          className="hidden"
          id="excel-upload"
          disabled={isUploading}
        />
        <label htmlFor="excel-upload">
          <Button 
            variant="outline" 
            disabled={isUploading}
            className="cursor-pointer"
            asChild
          >
            <span>
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? 'Subiendo...' : 'Seleccionar Excel'}
            </span>
          </Button>
        </label>
        <p className="text-sm text-gray-500">
          Formatos soportados: .xlsx, .xls
        </p>
      </div>
    </div>
  );
};
