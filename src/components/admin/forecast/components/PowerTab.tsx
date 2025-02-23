
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PowerChart } from "./PowerChart";
import { PowerTable } from "./PowerTable";
import { toast } from "sonner";

export const PowerTab = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Obtener los últimos datos de coes_historical
      const { data: historicalData, error: historicalError } = await supabase
        .from('coes_historical')
        .select('fecha, ejecutado')
        .order('fecha', { ascending: false })
        .limit(24); // Últimas 24 horas

      if (historicalError) throw historicalError;

      // Transformar los datos al formato esperado
      const transformedData = historicalData?.map(item => ({
        date: item.fecha,
        peak_value: item.ejecutado
      })) || [];

      setData(transformedData);
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
