
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "@/components/admin/UserManagement";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface CoesData {
  fecha: string;
  pronostico_diario: number | null;
  demanda_real: number | null;
  rango_inferior: number | null;
  rango_superior: number | null;
}

const AdminPanel = () => {
  const [forecastData, setForecastData] = useState<CoesData[]>([]);

  useEffect(() => {
    const fetchTodayForecast = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('coes_forecast')
        .select('*')
        .gte('fecha', today.toISOString())
        .lt('fecha', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString())
        .order('fecha', { ascending: true });

      if (error) {
        console.error('Error fetching forecast data:', error);
        return;
      }

      setForecastData(data || []);
    };

    fetchTodayForecast();
  }, []);

  return (
    <div className="container mx-auto py-16 space-y-6">
      <Card className="p-6">
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid grid-cols-2 gap-4">
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="forecast">Pronóstico</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="forecast">
            <Tabs defaultValue="daily" className="space-y-4">
              <TabsList className="grid grid-cols-4 gap-2">
                <TabsTrigger value="daily">Diario</TabsTrigger>
                <TabsTrigger value="historical">Histórico</TabsTrigger>
                <TabsTrigger value="power">Potencia</TabsTrigger>
                <TabsTrigger value="modulation">Modulación</TabsTrigger>
              </TabsList>

              <TabsContent value="daily">
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Pronóstico del Día</h3>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer>
                      <LineChart data={forecastData}>
                        <XAxis 
                          dataKey="fecha" 
                          tickFormatter={(value) => format(new Date(value), 'HH:mm')}
                        />
                        <YAxis />
                        <Tooltip 
                          labelFormatter={(value) => format(new Date(value), 'dd/MM/yyyy HH:mm')}
                          formatter={(value: any) => [
                            `${Number(value).toFixed(2)} MW`,
                            'Potencia'
                          ]}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="pronostico_diario" 
                          stroke="#156082" 
                          name="Pronóstico"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="demanda_real" 
                          stroke="#f39200" 
                          name="Demanda Real"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="rango_superior" 
                          stroke="#C00000" 
                          name="Rango Superior"
                          strokeWidth={1}
                          strokeDasharray="5 5"
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="rango_inferior" 
                          stroke="#C00000" 
                          name="Rango Inferior"
                          strokeWidth={1}
                          strokeDasharray="5 5"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="historical">
                <Card className="p-4">
                  <h3 className="text-lg font-semibold">Datos Históricos</h3>
                  {/* Implementar vista histórica */}
                </Card>
              </TabsContent>

              <TabsContent value="power">
                <Card className="p-4">
                  <h3 className="text-lg font-semibold">Potencia</h3>
                  {/* Implementar vista de potencia */}
                </Card>
              </TabsContent>

              <TabsContent value="modulation">
                <Card className="p-4">
                  <h3 className="text-lg font-semibold">Modulación</h3>
                  {/* Implementar vista de modulación */}
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default AdminPanel;
