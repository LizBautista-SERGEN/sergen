
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CoesData } from '@/types/forecast';

interface DailyForecastTableProps {
  data: CoesData[];
}

export const DailyForecastTable = ({ data }: DailyForecastTableProps) => {
  const formatTime = (dateStr: string) => {
    return dateStr.split('T')[1].substring(0, 5);
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Hora (UTC)</TableHead>
            <TableHead>Pronóstico (MW)</TableHead>
            <TableHead>Ejecutado (MW)</TableHead>
            <TableHead>Límite Superior (MW)</TableHead>
            <TableHead>Límite Inferior (MW)</TableHead>
            <TableHead>Reprogramado (MW)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{formatTime(row.fecha)}</TableCell>
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
  );
};
