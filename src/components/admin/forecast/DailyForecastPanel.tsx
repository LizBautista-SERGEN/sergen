
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { format, startOfDay, endOfDay, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DailyForecastChart } from "./DailyForecastChart";
import { DailyForecastTable } from "./DailyForecastTable";
import { CoesData } from "@/types/forecast";

export const DailyForecastPanel = () => {
  const [forecastData, setForecastData] = useState<CoesData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const timeZone = 'America/Lima';

  const fetchCoesData = async () => {
    try {
      setIsLoading(true);
      
      const now = new Date();
      const localDate = toZonedTime(now, timeZone);
      const today = startOfDay(localDate);
      const tomorrow = endOfDay(localDate);

      console.log('Consultando datos entre:', today.toISOString(), 'y', tomorrow.toISOString());

      const { data: existingData, error: dbError } = await supabase
        .from('coes_forecast')
        .select('fecha, pronostico_diario, demanda_real, rango_inferior, rango_superior, reprogramacion')
        .gte('fecha', today.toISOString())
        .lte('fecha', tomorrow.toISOString())
        .order('fecha', { ascending: true });

      if (dbError) {
        console.error('Error al obtener datos:', dbError);
        toast.error('Error al cargar los datos del pronóstico');
        return;
      }

      console.log('Datos obtenidos de la base de datos:', existingData);

      if (existingData && existingData.length > 0) {
        const processedData = existingData.map(row => ({
          ...row,
          pronostico_diario: row.pronostico_diario === 0 ? null : row.pronostico_diario,
          demanda_real: row.demanda_real === 0 ? null : row.demanda_real,
          rango_inferior: row.rango_inferior === 0 ? null : row.rango_inferior,
          rango_superior: row.rango_superior === 0 ? null : row.rango_superior,
          reprogramacion: row.reprogramacion === 0 ? null : row.reprogramacion
        }));

        console.log('Datos procesados:', processedData);
        setForecastData(processedData);
      }

      try {
        const { error: functionError } = await supabase.functions.invoke('get-coes-forecast');
        
        if (functionError) {
          console.error('Error al invocar función COES:', functionError);
          toast.error('Error al actualizar datos del COES');
        }

        const { data: freshData, error: freshError } = await supabase
          .from('coes_forecast')
          .select('fecha, pronostico_diario, demanda_real, rango_inferior, rango_superior, reprogramacion')
          .gte('fecha', today.toISOString())
          .lte('fecha', tomorrow.toISOString())
          .order('fecha', { ascending: true });

        if (freshError) {
          console.error('Error al obtener datos actualizados:', freshError);
        } else if (freshData && freshData.length > 0) {
          const processedFreshData = freshData.map(row => ({
            ...row,
            pronostico_diario: row.pronostico_diario === 0 ? null : row.pronostico_diario,
            demanda_real: row.demanda_real === 0 ? null : row.demanda_real,
            rango_inferior: row.rango_inferior === 0 ? null : row.rango_inferior,
            rango_superior: row.rango_superior === 0 ? null : row.rango_superior,
            reprogramacion: row.reprogramacion === 0 ? null : row.reprogramacion
          }));
          console.log('Datos frescos procesados:', processedFreshData);
          setForecastData(processedFreshData);
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

  const formatToLocalDate = (date: Date) => {
    const zonedDate = toZonedTime(date, timeZone);
    return format(zonedDate, 'dd/MM/yyyy');
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          Pronóstico COES - {formatToLocalDate(new Date())}
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
