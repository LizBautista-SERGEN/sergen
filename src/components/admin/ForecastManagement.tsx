
import { useState, useEffect } from "react";
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
  Ejecutado: number;
  "Prog. Diaria": number;
  "Prog. Semanal": number;
}

export const ForecastManagement = () => {
  const [loadingCoes, setLoadingCoes] = useState(false);
  const [coesData, setCoesData] = useState<CoesData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchCoesData = async () => {
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
        console.log('Datos de COES:', response);
        toast.success('Datos obtenidos exitosamente');
      }
      
    } catch (error) {
      console.error('Error al consultar COES:', error);
      const errorMessage = error.message || 'Error desconocido';
      setError(`Error al obtener datos de COES: ${errorMessage}`);
      toast.error(`Error al obtener datos de COES: ${errorMessage}`);
    } finally {
      setLoadingCoes(false);
    }
  };

  // Cargar datos automáticamente al montar el componente
  useEffect(() => {
    fetchCoesData();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col space-y-4 rounded-lg border p-6 bg-white">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Pronóstico de Demanda</h2>
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
                    tickCount={7}
                  />
                  <Tooltip 
                    labelFormatter={(label) => format(new Date(label), 'dd/MM/yyyy HH:mm')}
                    formatter={(value: any) => [`${value.toLocaleString()} MW`, '']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Ejecutado" 
                    stroke="#156082" 
                    strokeWidth={2}
                    dot={false}
                    name="Ejecutado"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Prog. Diaria" 
                    stroke="#f39200" 
                    strokeWidth={2}
                    dot={false}
                    name="Programación Diaria"
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Ejecutado</TableHead>
                  <TableHead>Prog. Diaria</TableHead>
                  <TableHead>Prog. Semanal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coesData.map((data, index) => (
                  <TableRow key={index}>
                    <TableCell>{format(new Date(data.Fecha), 'dd/MM/yyyy HH:mm')}</TableCell>
                    <TableCell>{data.Ejecutado.toLocaleString()} MW</TableCell>
                    <TableCell>{data["Prog. Diaria"].toLocaleString()} MW</TableCell>
                    <TableCell>{data["Prog. Semanal"].toLocaleString()} MW</TableCell>
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
