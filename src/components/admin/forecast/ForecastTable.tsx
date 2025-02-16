
import { format, parseISO } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ForecastTableProps {
  data: any[];
}

export const ForecastTable = ({ data }: ForecastTableProps) => {
  const formatNumber = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '-';
    return value.toLocaleString();
  };

  // Ordenamos los datos por fecha
  const sortedData = [...data].sort((a, b) => 
    new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Reprogramación (MW)</TableHead>
          <TableHead>Pronóstico Diario (MW)</TableHead>
          <TableHead>Rango Inferior (MW)</TableHead>
          <TableHead>Rango Superior (MW)</TableHead>
          <TableHead>Demanda Real (MW)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.map((item, index) => {
          // Extraemos solo la fecha y hora del campo fecha, ignorando created_at y updated_at
          const fechaOriginal = parseISO(item.fecha);
          return (
            <TableRow key={index}>
              <TableCell>
                {format(fechaOriginal, 'dd/MM/yyyy HH:mm')}
              </TableCell>
              <TableCell>{formatNumber(item.reprogramacion)}</TableCell>
              <TableCell>{formatNumber(item.pronostico_diario)}</TableCell>
              <TableCell>{formatNumber(item.rango_inferior)}</TableCell>
              <TableCell>{formatNumber(item.rango_superior)}</TableCell>
              <TableCell>{formatNumber(item.demanda_real)}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
