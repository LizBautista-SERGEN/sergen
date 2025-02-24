
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "@/components/admin/UserManagement";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO, startOfDay, endOfDay } from 'date-fns';
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
      
      // Obtener fecha actual en UTC
      const now = new Date();
      const today = startOfDay(now).toISOString();
      const tomorrow = endOfDay(now).toISOString();

      console.log('Consultando datos entre:', today, 'y', tomorrow);

      // Primero, obtener los datos de la base de datos
      const { data: existingData, error: dbError } = await supabase
        .from('coes_forecast')
        .select('fecha, pronostico_diario, demanda_real, rango_inferior, rango_superior, reprogramacion')
        .gte('fecha', today)
        .lte('fecha', tomorrow)
        .order('fecha', { ascending: true });

      if (dbError) {
        console.error('Error al obtener datos:', dbError);
        toast.error('Error al cargar los datos del pronóstico');
        return;
      }

      console.log('Datos obtenidos de la base de datos:', existingData);

      if (existingData && existingData.length > 0) {
        // Procesar los datos para convertir 0 a null
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

      // Luego intentar actualizar los datos desde COES
      try {
        const { error: functionError } = await supabase.functions.invoke('get-coes-forecast');
        
        if (functionError) {
          console.error('Error al invocar función COES:', functionError);
          toast.error('Error al actualizar datos del COES');
        }

        // Obtener los datos actualizados después de la llamada a COES
        const { data: freshData, error: freshError } = await supabase
          .from('coes_forecast')
          .select('fecha, pronostico_diario, demanda_real, rango_inferior, rango_superior, reprogramacion')
          .gte('fecha', today)
          .lte('fecha', tomorrow)
          .order('fecha', { ascending: true });

        if (freshError) {
          console.error('Error al obtener datos actualizados:', freshError);
        } else if (freshData && freshData.length > 0) {
          // Procesar los datos frescos para convertir 0 a null
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
                      Pronóstico COES - {format(new Date(), 'dd/MM/yyyy')}
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
                              tickFormatter={(value) => format(parseISO(value), 'HH:mm')}
                            />
                            <YAxis domain={['auto', 'auto']} />
                            <Tooltip 
                              labelFormatter={(value) => format(parseISO(value as string), 'dd/MM/yyyy HH:mm')}
                              formatter={(value: any) => value ? `${value} MW` : '-'}
                            />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="pronostico_diario" 
                              name="Pronóstico Diario"
                              stroke="#F97316" 
                              strokeWidth={2}
                              dot={false}
                              connectNulls
                            />
                            <Line 
                              type="monotone" 
                              dataKey="demanda_real" 
                              name="Demanda Real"
                              stroke="#0EA5E9" 
                              strokeWidth={2}
                              dot={false}
                              connectNulls
                            />
                            <Line 
                              type="monotone" 
                              dataKey="rango_superior" 
                              name="Rango Superior"
                              stroke="#00C000" 
                              strokeWidth={1}
                              strokeDasharray="5 5"
                              dot={false}
                              connectNulls
                            />
                            <Line 
                              type="monotone" 
                              dataKey="rango_inferior" 
                              name="Rango Inferior"
                              stroke="#00C000" 
                              strokeWidth={1}
                              strokeDasharray="5 5"
                              dot={false}
                              connectNulls
                            />
                            <Line 
                              type="monotone" 
                              dataKey="reprogramacion" 
                              name="Reprogramación"
                              stroke="#C00000" 
                              strokeWidth={2}
                              dot={false}
                              connectNulls
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Hora</TableHead>
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
                                <TableCell>{format(parseISO(row.fecha), 'HH:mm')}</TableCell>
                                <TableCell>{row.pronostico_diario || '-'}</TableCell>
                                <TableCell>{row.demanda_real || '-'}</TableCell>
                                <TableCell>{row.rango_superior || '-'}</TableCell>
                                <TableCell>{row.rango_inferior || '-'}</TableCell>
                                <TableCell>{row.reprogramacion || '-'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No hay datos disponibles para hoy
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
