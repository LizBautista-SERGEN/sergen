
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ForecastData {
  fecha: string;
  pronostico: number;
  rango_min: number;
  rango_max: number;
}

export const ForecastManagement = () => {
  const [loading, setLoading] = useState(false);
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchForecastData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-coes-data');

      if (error) throw error;

      if (Array.isArray(data)) {
        setForecastData(data);
        setLastUpdate(new Date());
        toast.success('Datos actualizados correctamente');
      } else {
        throw new Error('Formato de datos inválido');
      }
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
          <p className="text-sm text-gray-500">
            Última actualización: {format(lastUpdate, 'dd/MM/yyyy HH:mm:ss')}
          </p>
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

          {forecastData.length > 0 && (
            <div className="mt-4">
              <pre className="text-xs bg-gray-100 p-4 rounded">
                {JSON.stringify(forecastData, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
