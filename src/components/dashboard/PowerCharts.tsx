
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CoesData } from "@/types/forecast";
import { ForecastChart } from "@/components/admin/forecast/ForecastChart";
import { format, startOfDay, endOfDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  energyData: any[];
  date: Date | undefined;
};

export const PowerCharts = ({ date }: Props) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CoesData[]>([]);
  const currentDate = format(new Date(), "dd/MM/yyyy");

  const fetchData = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const startOfToday = startOfDay(today).toISOString();
      const endOfToday = endOfDay(today).toISOString();

      const { data: forecastData, error } = await supabase
        .from('coes_forecast')
        .select('fecha, reprogramado, pronostico, rango_inferior, rango_superior, ejecutado')
        .gte('fecha', startOfToday)
        .lte('fecha', endOfToday)
        .order('fecha', { ascending: true });

      if (error) {
        console.error('Error al obtener datos:', error);
        throw error;
      }

      if (!forecastData || forecastData.length === 0) {
        console.log('No hay datos disponibles para hoy');
        setData([]);
        return;
      }

      setData(forecastData);
    } catch (error) {
      console.error('Error fetching forecast data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    const interval = setInterval(() => {
      fetchData();
    }, 15 * 60 * 1000); // 15 minutos en milisegundos

    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Pronóstico de Demanda - {currentDate}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {data.length > 0 ? (
          <ForecastChart data={data} />
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">No hay datos disponibles para hoy</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
