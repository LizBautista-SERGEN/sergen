
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const ForecastManagement = () => {
  const [loading, setLoading] = useState(false);
  const [forecastData, setForecastData] = useState<any[]>([]);

  const fetchForecastData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-coes-data');

      if (error) throw error;

      setForecastData(data || []);
      toast.success('Datos actualizados correctamente');
    } catch (error: any) {
      console.error('Error:', error);
      toast.error('Error al obtener datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecastData();
  }, []);

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Pronóstico de Demanda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Button 
              onClick={fetchForecastData} 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : 'Actualizar datos'}
            </Button>
          </div>

          <div className="text-sm text-gray-500">
            Próximamente: Implementación de gráficos y tablas de pronóstico
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
