
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, subDays } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { ExportDataDialog } from "./ExportDataDialog";

export const DemandHistoryView = () => {
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 3), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(subDays(new Date(), 1), 'yyyy-MM-dd'));
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [rawResponse, setRawResponse] = useState<any>(null);

  const fetchHistoricalData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-historical-demand', {
        body: { startDate, endDate }
      });

      if (error) throw error;

      // Guardar la respuesta cruda para diagnóstico
      setRawResponse(data);
      console.log('Respuesta completa:', data);

      if (Array.isArray(data)) {
        setHistoricalData(data);
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

          {/* Mostrar la respuesta cruda para diagnóstico */}
          {rawResponse && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg overflow-auto max-h-[500px]">
              <h3 className="text-lg font-semibold mb-2">Datos del Excel:</h3>
              <pre className="text-sm">
                {JSON.stringify(rawResponse, null, 2)}
              </pre>
            </div>
          )}

          {historicalData.length > 0 && (
            <div className="space-y-6 mt-4">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={historicalData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis 
                      dataKey="hora"
                      tickFormatter={(value) => format(new Date(`2000-01-01T${value}`), 'HH:mm')}
                    />
                    <YAxis 
                      tickFormatter={(value) => `${value.toLocaleString()}`}
                    />
                    <Tooltip 
                      labelFormatter={(label) => `Hora: ${format(new Date(`2000-01-01T${label}`), 'HH:mm')}`}
                      formatter={(value: any) => [`${value.toLocaleString()} MW`, '']}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="ejecutado"
                      name="Ejecutado"
                      stroke="#156082" 
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="programado"
                      name="Programado"
                      stroke="#C00000"
                      strokeDasharray="5 5"
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
