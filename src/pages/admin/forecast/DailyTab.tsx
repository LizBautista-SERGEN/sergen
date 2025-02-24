
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

export const DailyTab = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      let { data: forecastData, error } = await supabase
        .from('coes_forecast')
        .select('*')
        .order('fecha', { ascending: true });

      if (error) {
        console.error('Error al obtener datos:', error);
        throw error;
      }

      if (!forecastData || forecastData.length === 0) {
        console.log('No hay datos disponibles');
        toast.info('No hay datos disponibles');
        setData([]);
        return;
      }

      console.log('Cantidad de datos recuperados:', forecastData.length);
      setData(forecastData);

    } catch (error) {
      console.error('Error fetching forecast data:', error);
      toast.error('Error al cargar los datos del pronóstico');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      setLoading(true);
      const response = await supabase.functions.invoke('get-coes-forecast');
      
      if (!response.data?.success) {
        console.error('Error en la respuesta:', response);
        throw new Error('Error actualizando datos del COES');
      }

      console.log('Respuesta de get-coes-forecast:', response.data);
      
      await fetchData();
      toast.success(`Datos actualizados correctamente (${response.data.count} registros)`);
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Error al actualizar los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    const interval = setInterval(() => {
      refreshData();
    }, 15 * 60 * 1000); // 15 minutos

    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Pronóstico Diario</CardTitle>
        <Button 
          variant="outline" 
          onClick={refreshData} 
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <div>Cargando datos...</div>
          ) : data.length > 0 ? (
            <>
              {/* Aquí agregaremos los gráficos y tablas */}
              <div className="h-[400px]">
                {/* ForecastChart irá aquí */}
              </div>
              <div className="overflow-x-auto">
                {/* ForecastTable irá aquí */}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay datos disponibles. Haz clic en "Actualizar" para cargar los datos.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
