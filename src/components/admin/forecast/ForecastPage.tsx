
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ForecastChart } from "./ForecastChart";
import { ForecastTable } from "./ForecastTable";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { ExportDataDialog } from "../ExportDataDialog";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { HistoricalTab } from "./HistoricalTab";
import { startOfDay, endOfDay, addDays } from "date-fns";

export const ForecastPage = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const { session } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const tomorrow = addDays(today, 1);
      
      // Configurar la hora inicial a las 00:30 del día actual
      const startTime = startOfDay(today);
      startTime.setMinutes(30);
      
      // Configurar la hora final a las 00:00 del día siguiente
      const endTime = startOfDay(tomorrow);

      const { data: forecastData, error } = await supabase
        .from('coes_forecast')
        .select('*')
        .gte('fecha', startTime.toISOString())
        .lte('fecha', endTime.toISOString())
        .order('fecha', { ascending: true });

      if (error) {
        console.error('Error al obtener datos:', error);
        throw error;
      }

      // Eliminar datos antiguos
      const { error: deleteError } = await supabase
        .from('coes_forecast')
        .delete()
        .lt('fecha', startTime.toISOString());

      if (deleteError) {
        console.error('Error al eliminar datos antiguos:', deleteError);
      }

      if (!forecastData || forecastData.length === 0) {
        console.log('No hay datos disponibles para hoy');
        toast.info('No hay datos disponibles para hoy');
        setData([]);
        return;
      }

      console.log('Datos obtenidos de Supabase:', forecastData);
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
    if (session) {
      refreshData();
    }
  }, [session]);

  useEffect(() => {
    fetchData();
    
    const interval = setInterval(() => {
      refreshData();
    }, 15 * 60 * 1000); // 15 minutos en milisegundos

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <Tabs defaultValue="forecast" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="forecast">Diario</TabsTrigger>
          <TabsTrigger value="historical">Histórico</TabsTrigger>
        </TabsList>
        
        <TabsContent value="forecast">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Pronóstico de Demanda</h2>
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={refreshData} 
                disabled={loading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
              <ExportDataDialog 
                data={data} 
                filename="pronostico-demanda" 
                chartComponent={<ForecastChart data={data} forPDF={true} />}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {data.length > 0 ? (
              <>
                <div className="bg-white p-4 rounded-lg shadow h-[400px]">
                  <ForecastChart data={data} />
                </div>
                <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
                  <ForecastTable data={data} />
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay datos disponibles para hoy. Haz clic en "Actualizar" para cargar los datos.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="historical">
          <HistoricalTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
