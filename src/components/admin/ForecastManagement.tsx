
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [coesData, setCoesData] = useState<CoesData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const formatDateForCOES = (dateStr: string): string => {
    const date = new Date(dateStr);
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const handleConsultarCoes = async () => {
    if (!fechaInicio || !fechaFin) {
      toast.error('Por favor seleccione las fechas');
      return;
    }

    setLoadingCoes(true);
    setError(null);
    try {
      const formattedFechaInicio = formatDateForCOES(fechaInicio);
      const formattedFechaFin = formatDateForCOES(fechaFin);
      
      console.log('Enviando consulta con fechas:', { formattedFechaInicio, formattedFechaFin });
      
      const { data, error: functionError } = await supabase.functions.invoke('get-coes-data', {
        body: {
          fechaInicio: formattedFechaInicio,
          fechaFin: formattedFechaFin,
        }
      });

      if (functionError) {
        console.error('Error en respuesta de función:', functionError);
        throw functionError;
      }

      if (!data || !Array.isArray(data)) {
        console.error('Respuesta inválida:', data);
        throw new Error('Formato de respuesta inválido');
      }

      if (data.length === 0) {
        setError('No se encontraron datos para el período seleccionado');
        toast.warning('No se encontraron datos para el período seleccionado');
      } else {
        setCoesData(data);
        console.log('Datos de COES:', data);
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

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col space-y-4 rounded-lg border p-6 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <Label>Desde:</Label>
            <Input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <Label>Hasta:</Label>
            <Input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full"
            />
          </div>
          <Button 
            onClick={handleConsultarCoes} 
            disabled={loadingCoes}
            className="w-full"
          >
            {loadingCoes ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Consultando...
              </>
            ) : 'Consultar'}
          </Button>
          <Button variant="outline" className="w-full">
            Exportar
          </Button>
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
                  <YAxis />
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
