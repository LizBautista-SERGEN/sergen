
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

  useEffect(() => {
    const fetchPeakData = async () => {
      const { data, error } = await supabase
        .from('coes_historical')
        .select('fecha, ejecutado')
        .gte('fecha', format(new Date().setDate(1), "yyyy-MM-dd"))
        .lte('fecha', new Date().toISOString())
        .order('fecha', { ascending: true });

      if (error) {
        console.error('Error fetching peak data:', error);
        return;
      }

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
    };

    fetchPeakData();
  }, []);

  return (
    <div className="space-y-6">
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
            {peakData.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{format(new Date(row.fecha), 'dd/MM/yyyy')}</TableCell>
                <TableCell>{row.hora}</TableCell>
                <TableCell>{row.ejecutado.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
