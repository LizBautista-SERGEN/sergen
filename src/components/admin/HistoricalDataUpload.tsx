
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const HistoricalDataUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Por favor selecciona un archivo Excel (.xlsx o .xls)');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      // Primero eliminamos los datos existentes
      const { error: deleteError } = await supabase
        .from('coes_historical')
        .delete()
        .not('id', 'is', null);

      if (deleteError) throw deleteError;

      // Luego subimos los nuevos datos
      const { error } = await supabase.functions.invoke('upload-historical-data', {
        body: formData
      });

      if (error) throw error;

      toast.success('Datos históricos actualizados correctamente');
    } catch (error: any) {
      console.error('Error al subir archivo:', error);
      toast.error('Error al procesar el archivo: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
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
  );
};
