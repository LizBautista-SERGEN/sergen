
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

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No hay sesión activa');
      }

      const { error } = await supabase.functions.invoke('upload-energy-data', {
        body: formData,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      toast.success('Datos subidos exitosamente');
      onUploadSuccess();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al subir datos');
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
          </Label>
        </div>
      </CardContent>
    </Card>
  );
};
