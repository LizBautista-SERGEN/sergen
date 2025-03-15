
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DailyForecastChart } from "./DailyForecastChart";
import { DailyForecastTable } from "./DailyForecastTable";
import { CoesData } from "@/types/forecast";

export const DailyForecastPanel = () => {
  const [forecastData, setForecastData] = useState<CoesData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCoesData = async () => {
    try {
      setIsLoading(true);
      
      const now = new Date();
      now.setUTCHours(0, 0, 0, 0);
      const tomorrow = new Date(now);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

      console.log('Consultando datos entre:', now.toISOString(), 'y', tomorrow.toISOString());

      const { data: existingData, error: dbError } = await supabase
        .from('coes_forecast')
        .select('fecha, reprogramado, pronostico, rango_inferior, rango_superior, ejecutado')
        .gte('fecha', now.toISOString())
        .lt('fecha', tomorrow.toISOString())
        .order('fecha', { ascending: true });

      if (dbError) {
        console.error('Error al obtener datos:', dbError);
        toast.error('Error al cargar los datos del pronóstico');
        return;
      }

      console.log('Datos obtenidos de la base de datos:', existingData);

      if (existingData && existingData.length > 0) {
        setForecastData(existingData);
      }

      try {
        const { error: functionError } = await supabase.functions.invoke('get-coes-forecast');
        
        if (functionError) {
          console.error('Error al invocar función COES:', functionError);
          toast.error('Error al actualizar datos del COES');
        }

        const { data: freshData, error: freshError } = await supabase
          .from('coes_forecast')
          .select('fecha, reprogramado, pronostico, rango_inferior, rango_superior, ejecutado')
          .gte('fecha', now.toISOString())
          .lt('fecha', tomorrow.toISOString())
          .order('fecha', { ascending: true });

        if (freshError) {
          console.error('Error al obtener datos actualizados:', freshError);
        } else if (freshData && freshData.length > 0) {
          console.log('Datos frescos recibidos:', freshData);
          setForecastData(freshData);
        }
      } catch (functionError) {
        console.error('Error al llamar función COES:', functionError);
      }
    } catch (error) {
      console.error('Error en fetchCoesData:', error);
      toast.error('Error al cargar los datos del pronóstico');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoesData();
    const interval = setInterval(fetchCoesData, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          Pronóstico COES - {new Date().toISOString().split('T')[0]} (UTC)
        </h3>
        {isLoading && (
          <div className="text-sm text-gray-500">
            Actualizando datos...
          </div>
        )}
      </div>
      
      {forecastData.length > 0 ? (
        <>
          <DailyForecastChart data={forecastData} />
          <DailyForecastTable data={forecastData} />
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No hay datos disponibles para hoy
        </div>
      )}
    </Card>
  );
};
