
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PeakData {
  fecha: string;
  ejecutado: number;
  hora: string;
}

export const PowerPeaks = () => {
  const [peakData, setPeakData] = useState<PeakData[]>([]);
  const [rawRecords, setRawRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPeakData = async () => {
      setLoading(true);
      setError(null);
      try {
        // First get the first 5 raw records to display them
        const { data: rawData, error: rawError } = await supabase
          .from('coes_historical')
          .select('*')
          .limit(5);

        if (rawError) {
          console.error('Error fetching raw data:', rawError);
          setError(`Error fetching raw data: ${rawError.message}`);
        } else if (rawData) {
          console.log('Successfully fetched raw records:', rawData.length);
          console.log('Sample raw records:', rawData);
          setRawRecords(rawData);
        }

        // Fetch peak data for the chart
        const { data, error } = await supabase
          .from('coes_historical')
          .select('fecha, ejecutado')
          .gte('fecha', format(new Date().setDate(1), "yyyy-MM-dd"))
          .lte('fecha', new Date().toISOString())
          .order('fecha', { ascending: true });

        if (error) {
          console.error('Error fetching peak data:', error);
          setError(`Error fetching peak data: ${error.message}`);
          return;
        }

        console.log(`Retrieved ${data?.length || 0} records for peak data processing`);

        // Filtrar solo los datos entre 18:00 y 23:00 y encontrar el pico por día
        const dailyPeaks = data?.reduce((acc: PeakData[], curr) => {
          const date = new Date(curr.fecha);
          const hour = date.getHours();
          
          if (hour >= 18 && hour <= 23 && curr.ejecutado) {
            const dateStr = format(date, 'yyyy-MM-dd');
            const existingPeak = acc.find(p => p.fecha.startsWith(dateStr));
            
            if (!existingPeak || (existingPeak && curr.ejecutado > existingPeak.ejecutado)) {
              const newPeak = {
                fecha: format(date, 'yyyy-MM-dd'),
                ejecutado: curr.ejecutado,
                hora: format(date, 'HH:mm')
              };
              
              if (existingPeak) {
                const index = acc.indexOf(existingPeak);
                acc[index] = newPeak;
              } else {
                acc.push(newPeak);
              }
            }
          }
          return acc;
        }, []);

        setPeakData(dailyPeaks || []);
        console.log(`Processed ${dailyPeaks?.length || 0} daily peaks`);
      } catch (err: any) {
        console.error('Error in fetchPeakData:', err);
        setError(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPeakData();
  }, []);

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-500 rounded-md">
          {error}
        </div>
      ) : (
        <>
          <div className="p-4 bg-blue-50 rounded-md">
            <h3 className="font-medium mb-2">Primeros 5 registros de la tabla coes_historical:</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Ejecutado</TableHead>
                  <TableHead>Reprog. Diaria</TableHead>
                  <TableHead>Prog. Semanal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rawRecords.length > 0 ? (
                  rawRecords.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{format(new Date(row.fecha), 'dd/MM/yyyy HH:mm')}</TableCell>
                      <TableCell>{row.ejecutado?.toFixed(2) || 'N/A'}</TableCell>
                      <TableCell>{row.reprogramacion_diaria?.toFixed(2) || 'N/A'}</TableCell>
                      <TableCell>{row.prog_semanal?.toFixed(2) || 'N/A'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">No se encontraron registros</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer>
              <BarChart data={peakData}>
                <XAxis 
                  dataKey="fecha"
                  tickFormatter={(value) => format(new Date(value), 'dd/MM')}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => format(new Date(value), 'dd/MM/yyyy')}
                  formatter={(value: any) => [`${Number(value).toFixed(2)} MW`, 'Potencia']}
                />
                <Bar dataKey="ejecutado" fill="#156082" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Potencia (MW)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {peakData.length > 0 ? (
                  peakData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{format(new Date(row.fecha), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{row.hora}</TableCell>
                      <TableCell>{row.ejecutado.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">No hay datos de picos disponibles</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
};
