
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CoesData {
  Fecha: string;
  "Reprogramación Diaria": number | null;
  "Pronóstico": number | null;
  "Rango Mínimo": number | null;
  "Rango Máximo": number | null;
  "Ejecutado": number | null;
}

export const ForecastManagement = () => {
  const [loadingCoes, setLoadingCoes] = useState(false);
  const [coesData, setCoesData] = useState<CoesData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchCoesData = useCallback(async () => {
    setLoadingCoes(true);
    setError(null);
    try {
      const { data: response, error: functionError } = await supabase.functions.invoke('get-coes-data');

      if (functionError) {
        console.error('Error en respuesta de función:', functionError);
        throw functionError;
      }

      if (!response || !Array.isArray(response)) {
        console.error('Respuesta inválida:', response);
        throw new Error('Formato de respuesta inválido');
      }

      if (response.length === 0) {
        setError('No se encontraron datos disponibles');
        toast.warning('No se encontraron datos disponibles');
      } else {
        setCoesData(response);
        setLastUpdate(new Date());
        console.log('Datos de COES actualizados:', response);
      }
      
    } catch (error) {
      console.error('Error al consultar COES:', error);
      const errorMessage = error.message || 'Error desconocido';
      setError(`Error al obtener datos de COES: ${errorMessage}`);
      toast.error(`Error al obtener datos de COES: ${errorMessage}`);
    } finally {
      setLoadingCoes(false);
    }
  }, []);

  useEffect(() => {
    fetchCoesData();

    // Configurar actualización automática cada 30 minutos
    const interval = setInterval(() => {
      fetchCoesData();
    }, 30 * 60 * 1000); // 30 minutos en milisegundos

    return () => clearInterval(interval);
  }, [fetchCoesData]);

  // Función auxiliar para formatear números de manera segura
  const formatNumber = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '-';
    return value.toLocaleString();
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col space-y-4 rounded-lg border p-6 bg-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Pronóstico de Demanda</h2>
            <p className="text-sm text-gray-500">
              Última actualización: {format(lastUpdate, 'dd/MM/yyyy HH:mm:ss')}
            </p>
          </div>
          <div className="flex gap-4">
            <Button 
              onClick={fetchCoesData} 
              disabled={loadingCoes}
              variant="outline"
            >
              {loadingCoes ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : 'Actualizar datos'}
            </Button>
            <Button variant="outline">
              Exportar
            </Button>
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm mt-2">
            {error}
          </div>
        )}

        {coesData.length > 0 && (
          <div className="mt-4 space-y-6">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={coesData}>
                  <XAxis 
                    dataKey="Fecha"
                    tickFormatter={(value) => format(new Date(value), 'HH:mm')}
                  />
                  <YAxis 
                    domain={[6000, 9000]}
                    tickFormatter={(value) => `${value.toLocaleString()}`}
                  />
                  <Tooltip 
                    labelFormatter={(label) => format(new Date(label), 'dd/MM/yyyy HH:mm')}
                    formatter={(value: any) => value !== null ? [`${value.toLocaleString()} MW`, ''] : ['-', '']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Ejecutado"
                    stroke="#156082" 
                    strokeWidth={2}
                    name="Ejecutado"
                    dot={false}
                    connectNulls={true}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Reprogramación Diaria"
                    stroke="#C00000"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Reprogramación"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Pronóstico"
                    stroke="#F39200"
                    strokeWidth={2}
                    name="Pronóstico"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Rango Máximo"
                    stroke="#90C418"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    name="Rango Máximo"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Rango Mínimo"
                    stroke="#90C418"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    name="Rango Mínimo"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Programado</TableHead>
                  <TableHead>Pronóstico</TableHead>
                  <TableHead>Rango Mínimo</TableHead>
                  <TableHead>Rango Máximo</TableHead>
                  <TableHead>Ejecutado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coesData.map((data, index) => (
                  <TableRow key={index}>
                    <TableCell>{format(new Date(data.Fecha), 'dd/MM/yyyy HH:mm')}</TableCell>
                    <TableCell>{data["Reprogramación Diaria"] ? `${formatNumber(data["Reprogramación Diaria"])} MW` : '-'}</TableCell>
                    <TableCell>{data["Pronóstico"] ? `${formatNumber(data["Pronóstico"])} MW` : '-'}</TableCell>
                    <TableCell>{data["Rango Mínimo"] ? `${formatNumber(data["Rango Mínimo"])} MW` : '-'}</TableCell>
                    <TableCell>{data["Rango Máximo"] ? `${formatNumber(data["Rango Máximo"])} MW` : '-'}</TableCell>
                    <TableCell>{data["Ejecutado"] ? `${formatNumber(data["Ejecutado"])} MW` : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};
