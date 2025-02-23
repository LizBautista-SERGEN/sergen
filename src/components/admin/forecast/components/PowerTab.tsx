
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PowerChart } from "./PowerChart";
import { PowerTable } from "./PowerTable";
import { toast } from "sonner";
import { format, setHours, setMinutes, setSeconds } from "date-fns";

export const PowerTab = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPowerPeaks = async () => {
    try {
      setLoading(true);
      
      const startDate = new Date();
      const endDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // Últimos 30 días

      const { data: historicalData, error } = await supabase
        .from('coes_historical')
        .select('fecha, ejecutado')
        .gte('fecha', format(setHours(startDate, 18), "yyyy-MM-dd HH:mm:ss"))
        .lte('fecha', format(setHours(endDate, 23), "yyyy-MM-dd HH:mm:ss"))
        .order('fecha', { ascending: true });

      if (error) throw error;

      // Procesar datos para encontrar picos diarios entre 18:00 y 23:00
      const dailyPeaks = historicalData.reduce((acc: any[], current) => {
        const date = format(new Date(current.fecha), 'yyyy-MM-dd');
        const currentHour = new Date(current.fecha).getHours();
        
        if (currentHour >= 18 && currentHour <= 23) {
          const existingPeak = acc.find(peak => format(new Date(peak.date), 'yyyy-MM-dd') === date);
          
          if (!existingPeak || current.ejecutado > existingPeak.peak_value) {
            if (existingPeak) {
              existingPeak.peak_value = current.ejecutado;
              existingPeak.peak_time = format(new Date(current.fecha), 'HH:mm:ss');
            } else {
              acc.push({
                date: current.fecha,
                peak_time: format(new Date(current.fecha), 'HH:mm:ss'),
                peak_value: current.ejecutado,
                id: `${date}-${current.ejecutado}`
              });
            }
          }
        }
        
        return acc;
      }, []);

      setData(dailyPeaks);
    } catch (error) {
      console.error('Error fetching power peaks:', error);
      toast.error('Error al cargar los picos de potencia');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPowerPeaks();
    const interval = setInterval(fetchPowerPeaks, 12 * 60 * 60 * 1000); // Cada 12 horas
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Picos de Potencia (18:00 - 23:00)</h2>
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="text-center py-8">Cargando datos...</div>
        ) : (
          <>
            <div className="bg-white p-4 rounded-lg shadow h-[400px]">
              <PowerChart data={data} />
            </div>
            <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
              <PowerTable data={data} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
