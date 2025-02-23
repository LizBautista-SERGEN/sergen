
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PowerChart } from "./PowerChart";
import { PowerTable } from "./PowerTable";
import { toast } from "sonner";
import { format, parse } from "date-fns";

export const PowerTab = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: historicalData, error: historicalError } = await supabase
        .from('coes_historical')
        .select('fecha, ejecutado')
        .gte('fecha', format(new Date().setHours(18, 0, 0, 0), "yyyy-MM-dd HH:mm:ss"))
        .lte('fecha', format(new Date().setHours(23, 0, 0, 0), "yyyy-MM-dd HH:mm:ss"))
        .order('ejecutado', { ascending: false });

      if (historicalError) throw historicalError;

      // Agrupar por día y encontrar el máximo
      const dailyPeaks = historicalData?.reduce((acc: any[], current) => {
        const date = format(new Date(current.fecha), 'yyyy-MM-dd');
        const time = format(new Date(current.fecha), 'HH:mm:ss');
        const existingDay = acc.find(item => format(new Date(item.date), 'yyyy-MM-dd') === date);
        
        if (!existingDay || current.ejecutado > existingDay.peak_value) {
          if (existingDay) {
            existingDay.peak_value = current.ejecutado;
            existingDay.peak_time = time;
          } else {
            acc.push({
              date: current.fecha,
              peak_value: current.ejecutado,
              peak_time: time
            });
          }
        }
        
        return acc;
      }, []);

      setData(dailyPeaks || []);
    } catch (error) {
      console.error('Error fetching power data:', error);
      toast.error('Error al cargar los datos de potencia');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Actualizar cada 12 horas
    const interval = setInterval(() => {
      fetchData();
    }, 12 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Potencia Máxima (18:00 - 23:00)</h2>
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-4 rounded-lg shadow h-[400px]">
          <PowerChart data={data} />
        </div>
        <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
          <PowerTable data={data} />
        </div>
      </div>
    </div>
  );
};
