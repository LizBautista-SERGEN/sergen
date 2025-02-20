
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PowerChart } from "./PowerChart";
import { PowerTable } from "./PowerTable";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export const PowerTab = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const { session } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('power_peaks')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setData(data || []);
    } catch (error) {
      console.error('Error fetching power peaks:', error);
      toast.error('Error al cargar los datos de potencia');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Actualizar cada 900 segundos (15 minutos)
    const interval = setInterval(() => {
      fetchData();
    }, 900 * 1000);

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
          <PowerTable data={data} onDataChange={fetchData} />
        </div>
      </div>
    </div>
  );
};
