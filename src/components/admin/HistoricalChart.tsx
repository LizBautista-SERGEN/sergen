
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface HistoricalData {
  fecha: string;
  demanda_programada: number;
  reprogramacion_diaria: number;
  prog_semanal: number;
  ejecutado: number;
}

export const HistoricalChart = () => {
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);

  const fetchHistoricalData = async () => {
    try {
      const { data, error } = await supabase
        .from('coes_historical')
        .select('*')
        .order('fecha', { ascending: true });

      if (error) throw error;

      setHistoricalData(data || []);
    } catch (error) {
      console.error('Error fetching historical data:', error);
      toast.error('Error al cargar los datos históricos');
    }
  };

  useEffect(() => {
    fetchHistoricalData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="h-[400px] w-full">
        <ResponsiveContainer>
          <LineChart data={historicalData}>
            <XAxis 
              dataKey="fecha" 
              tickFormatter={(value) => format(new Date(value), 'dd/MM/yyyy')}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={(value) => format(new Date(value), 'dd/MM/yyyy HH:mm')}
              formatter={(value: any) => [`${Number(value).toFixed(2)} MW`, 'Potencia']}
            />
            <Line 
              type="monotone" 
              dataKey="demanda_programada" 
              stroke="#156082" 
              name="Demanda Programada"
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="reprogramacion_diaria" 
              stroke="#f39200" 
              name="Reprogramación"
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="prog_semanal" 
              stroke="#00C000" 
              name="Programación Semanal"
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="ejecutado" 
              stroke="#C00000" 
              name="Ejecutado"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
