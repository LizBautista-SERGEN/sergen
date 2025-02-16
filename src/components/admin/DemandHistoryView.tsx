
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, parse } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { ExportDataDialog } from "./ExportDataDialog";

export const DemandHistoryView = () => {
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [historicalData, setHistoricalData] = useState<any[]>([]);

  const parseDateTime = (dateTimeStr: string) => {
    try {
      // Asumiendo que el formato es "DD/MM/YYYY HH:mm"
      const parsedDate = parse(dateTimeStr, 'dd/MM/yyyy HH:mm', new Date());
      return {
        fecha: format(parsedDate, 'dd/MM/yyyy'),
        hora: format(parsedDate, 'HH:mm')
      };
    } catch (error) {
      console.error('Error parseando fecha:', dateTimeStr, error);
      return { fecha: '', hora: '' };
    }
  };

  const fetchHistoricalData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-historical-demand', {
        body: { startDate, endDate }
      });

      if (error) throw error;

      if (Array.isArray(data)) {
        // Procesar los datos separando fecha y hora
        const processedData = data.map(item => {
          const { fecha, hora } = parseDateTime(item.fecha);
          return {
            ...item,
            fecha,
            hora
          };
        });
        setHistoricalData(processedData);
      } else {
        console.error('Datos recibidos no son un array:', data);
        toast.error('Formato de datos incorrecto');
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
      toast.error('Error al obtener datos históricos');
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = () => {
    return historicalData.map(item => ({
      time: `${item.fecha} ${item.hora}`,
      Programado: item.programado,
      Ejecutado: item.ejecutado
    }));
  };

  return (
    <div className="space-y-6 p-6">
      <Card className="p-6">
        <div className="flex flex-col space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <div className="relative">
              <label className="block text-sm font-medium mb-1">Desde:</label>
              <Calendar className="absolute top-9 left-3 h-4 w-4 text-gray-500" />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium mb-1">Hasta:</label>
              <Calendar className="absolute top-9 left-3 h-4 w-4 text-gray-500" />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button 
              onClick={fetchHistoricalData}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Consultando...
                </>
              ) : 'Consultar'}
            </Button>
            <ExportDataDialog 
              data={historicalData}
              filename={`historico-demanda-${format(new Date(), 'yyyyMMdd')}`}
            />
          </div>

          {historicalData.length > 0 && (
            <div className="space-y-6 mt-4">
              <div className="h-[400px] w-full bg-white rounded-lg p-4 shadow">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={prepareChartData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis 
                      dataKey="time"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={Math.ceil(historicalData.length / 12)}
                    />
                    <YAxis 
                      label={{ 
                        value: 'Potencia (MW)', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle' }
                      }}
                      tickFormatter={(value) => `${value.toLocaleString()}`}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`${Number(value).toLocaleString()} MW`, '']}
                      labelFormatter={(label) => `Fecha/Hora: ${label}`}
                    />
                    <Legend verticalAlign="top" height={36}/>
                    <Line 
                      type="monotone" 
                      dataKey="Programado"
                      stroke="#C00000"
                      strokeWidth={2}
                      dot={false}
                      strokeDasharray="5 5"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Ejecutado"
                      stroke="#156082"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Hora</TableHead>
                    <TableHead>Programado (MW)</TableHead>
                    <TableHead>Ejecutado (MW)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historicalData.map((data, index) => (
                    <TableRow key={index}>
                      <TableCell>{data.fecha}</TableCell>
                      <TableCell>{data.hora}</TableCell>
                      <TableCell>{data.programado?.toLocaleString() || '-'}</TableCell>
                      <TableCell>{data.ejecutado?.toLocaleString() || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
