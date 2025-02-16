
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ForecastChart } from "./ForecastChart";
import { ForecastTable } from "./ForecastTable";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { ExportDataDialog } from "../ExportDataDialog";

export const ForecastPage = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: forecastData, error } = await supabase
        .from('coes_forecast')
        .select('*')
        .order('fecha', { ascending: true });

      if (error) throw error;

      if (!forecastData || forecastData.length === 0) {
        toast.info('No hay datos disponibles');
        setData([]);
        return;
      }

      setData(forecastData);
      console.log('Datos cargados de Supabase:', forecastData);

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
      
      if (!response.data.success) {
        throw new Error('Error actualizando datos del COES');
      }

      console.log('Respuesta de la función get-coes-forecast:', response.data);
      await fetchData();
      toast.success('Datos actualizados correctamente');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Error al actualizar los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
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
            <p className="text-gray-500">No hay datos disponibles. Haz clic en "Actualizar" para cargar los datos.</p>
          </div>
        )}
      </div>
    </div>
  );
};
