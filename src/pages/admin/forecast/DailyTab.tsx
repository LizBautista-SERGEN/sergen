
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ForecastData {
  fecha: string;
  pronostico_diario: number;
  demanda_real: number;
  reprogramacion: number;
}

export const DailyTab = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ForecastData[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      let { data: forecastData, error } = await supabase
        .from('coes_forecast')
        .select('*')
        .order('fecha', { ascending: true });

      if (error) {
        console.error('Error al obtener datos:', error);
        throw error;
      }

      if (!forecastData || forecastData.length === 0) {
        console.log('No hay datos disponibles');
        toast.info('No hay datos disponibles');
        setData([]);
        return;
      }

      const formattedData = forecastData.map(item => ({
        ...item,
        fecha: format(new Date(item.fecha), 'dd/MM/yyyy', { locale: es })
      }));

      console.log('Datos formateados:', formattedData);
      setData(formattedData);

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
    fetchData();
    
    const interval = setInterval(() => {
      refreshData();
    }, 15 * 60 * 1000); // 15 minutos

    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Pronóstico Diario</CardTitle>
        <Button 
          variant="outline" 
          onClick={refreshData} 
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <div>Cargando datos...</div>
          ) : data.length > 0 ? (
            <>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="fecha" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="pronostico_diario"
                      name="Pronóstico Diario"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="demanda_real"
                      name="Demanda Real"
                      stroke="#82ca9d"
                    />
                    <Line
                      type="monotone"
                      dataKey="reprogramacion"
                      name="Reprogramación"
                      stroke="#ffc658"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Fecha</th>
                      <th className="text-right p-2">Pronóstico Diario</th>
                      <th className="text-right p-2">Demanda Real</th>
                      <th className="text-right p-2">Reprogramación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item) => (
                      <tr key={item.fecha} className="border-b">
                        <td className="p-2">{item.fecha}</td>
                        <td className="text-right p-2">{item.pronostico_diario?.toFixed(2)}</td>
                        <td className="text-right p-2">{item.demanda_real?.toFixed(2)}</td>
                        <td className="text-right p-2">{item.reprogramacion?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay datos disponibles. Haz clic en "Actualizar" para cargar los datos.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
