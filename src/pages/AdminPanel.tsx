
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "@/components/admin/UserManagement";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HistoricalDataUpload } from "@/components/admin/HistoricalDataUpload";
import { PowerPeaks } from "@/components/admin/PowerPeaks";
import { ModulationCalendar } from "@/components/admin/ModulationCalendar";
import { toast } from "sonner";

interface CoesData {
  fecha: string;
  pronostico_diario: number | null;
  demanda_real: number | null;
  rango_inferior: number | null;
  rango_superior: number | null;
  reprogramacion: number | null;
}

const AdminPanel = () => {
  const [forecastData, setForecastData] = useState<CoesData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCoesData = async () => {
    try {
      setIsLoading(true);
      
      // Primero, actualizar datos desde COES
      const response = await supabase.functions.invoke('get-coes-forecast');
      if (!response.data.success) {
        console.error('Error updating COES data:', response.data.error);
        toast.error('Error al actualizar datos del COES');
      } else {
        console.log('COES data updated successfully:', response.data.count, 'records');
      }

      // Luego, obtener todos los datos
      const { data, error } = await supabase
        .from('coes_forecast')
        .select('fecha, pronostico_diario, demanda_real, rango_inferior, rango_superior, reprogramacion')
        .order('fecha', { ascending: true });

      if (error) {
        console.error('Error fetching forecast data:', error);
        toast.error('Error al cargar los datos del pronóstico');
        return;
      }

      setForecastData(data || []);
    } catch (error) {
      console.error('Error in fetchCoesData:', error);
      toast.error('Error al cargar los datos del pronóstico');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoesData();
    const interval = setInterval(fetchCoesData, 15 * 60 * 1000); // Actualizar cada 15 minutos
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto py-16 space-y-6">
      <Card className="p-6">
        <Tabs defaultValue="forecast" className="space-y-4">
          <TabsList className="grid w-fit grid-cols-2 gap-4">
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="forecast">Pronóstico</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="forecast">
            <Tabs defaultValue="daily" className="space-y-4">
              <TabsList className="grid w-fit grid-cols-4 gap-2">
                <TabsTrigger value="daily">Diario</TabsTrigger>
                <TabsTrigger value="historical">Histórico</TabsTrigger>
                <TabsTrigger value="power">Potencia</TabsTrigger>
                <TabsTrigger value="modulation">Modulación</TabsTrigger>
              </TabsList>

              <TabsContent value="daily">
                <Card className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                      Pronóstico COES (UTC)
                    </h3>
                    {isLoading && (
                      <div className="text-sm text-gray-500">
                        Actualizando datos...
                      </div>
                    )}
                  </div>
                  
                  {forecastData.length > 0 ? (
                    <>
                      <div className="h-[400px] w-full mb-6">
                        <ResponsiveContainer>
                          <LineChart data={forecastData}>
                            <XAxis 
                              dataKey="fecha" 
                              tickFormatter={(value) => format(parseISO(value), 'dd/MM HH:mm')}
                            />
                            <YAxis domain={['auto', 'auto']} />
                            <Tooltip 
                              labelFormatter={(value) => format(parseISO(value as string), 'dd/MM/yyyy HH:mm')}
                              formatter={(value: any, name: string) => [
                                `${Number(value).toFixed(2)} MW`,
                                name
                              ]}
                            />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="pronostico_diario" 
                              name="Pronóstico Diario"
                              stroke="#156082" 
                              strokeWidth={2}
                              dot={false}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="demanda_real" 
                              name="Demanda Real"
                              stroke="#f39200" 
                              strokeWidth={2}
                              dot={false}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="rango_superior" 
                              name="Rango Superior"
                              stroke="#C00000" 
                              strokeWidth={1}
                              strokeDasharray="5 5"
                              dot={false}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="rango_inferior" 
                              name="Rango Inferior"
                              stroke="#C00000" 
                              strokeWidth={1}
                              strokeDasharray="5 5"
                              dot={false}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="reprogramacion" 
                              name="Reprogramación"
                              stroke="#00C000" 
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Fecha y Hora (UTC)</TableHead>
                              <TableHead>Pronóstico Diario (MW)</TableHead>
                              <TableHead>Demanda Real (MW)</TableHead>
                              <TableHead>Rango Superior (MW)</TableHead>
                              <TableHead>Rango Inferior (MW)</TableHead>
                              <TableHead>Reprogramación (MW)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {forecastData.map((row, index) => (
                              <TableRow key={index}>
                                <TableCell>{format(parseISO(row.fecha), 'dd/MM/yyyy HH:mm')}</TableCell>
                                <TableCell>{row.pronostico_diario?.toFixed(2) ?? '-'}</TableCell>
                                <TableCell>{row.demanda_real?.toFixed(2) ?? '-'}</TableCell>
                                <TableCell>{row.rango_superior?.toFixed(2) ?? '-'}</TableCell>
                                <TableCell>{row.rango_inferior?.toFixed(2) ?? '-'}</TableCell>
                                <TableCell>{row.reprogramacion?.toFixed(2) ?? '-'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No hay datos disponibles
                    </div>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="historical">
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Datos Históricos</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Subir archivo Excel con datos históricos. Se borrarán los datos existentes antes de importar los nuevos.
                  </p>
                  <HistoricalDataUpload />
                </Card>
              </TabsContent>

              <TabsContent value="power">
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Potencia Máxima (18:00 - 23:00)</h3>
                  <PowerPeaks />
                </Card>
              </TabsContent>

              <TabsContent value="modulation">
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Modulación</h3>
                  <ModulationCalendar />
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
