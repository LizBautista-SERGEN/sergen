
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { CoesData } from '@/types/forecast';

interface DailyForecastTableProps {
  data: CoesData[];
}

export const DailyForecastTable = ({ data }: DailyForecastTableProps) => {
  const timeZone = 'America/Lima';

  const formatToLocalTime = (dateStr: string) => {
    const date = parseISO(dateStr);
    const zonedDate = utcToZonedTime(date, timeZone);
    return format(zonedDate, 'HH:mm');
  };

  return (
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
          {data.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{formatToLocalTime(row.fecha)}</TableCell>
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
