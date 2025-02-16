
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
        {data.map((item, index) => (
          <TableRow key={index}>
            <TableCell>{format(parseISO(item.fecha), 'dd/MM/yyyy HH:mm')}</TableCell>
            <TableCell>{formatNumber(item.reprogramacion)}</TableCell>
            <TableCell>{formatNumber(item.pronostico_diario)}</TableCell>
            <TableCell>{formatNumber(item.rango_inferior)}</TableCell>
            <TableCell>{formatNumber(item.rango_superior)}</TableCell>
            <TableCell>{formatNumber(item.demanda_real)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
