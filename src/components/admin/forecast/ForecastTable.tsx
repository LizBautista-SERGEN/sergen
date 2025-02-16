
import { format } from 'date-fns';
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
          <TableHead>Reprog. Diaria (MW)</TableHead>
          <TableHead>Pronóstico (MW)</TableHead>
          <TableHead>Rango Mínimo (MW)</TableHead>
          <TableHead>Rango Máximo (MW)</TableHead>
          <TableHead>Ejecutado (MW)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, index) => (
          <TableRow key={index}>
            <TableCell>{format(new Date(item.fecha), 'dd/MM/yyyy HH:mm')}</TableCell>
            <TableCell>{formatNumber(item.reprogramacion_diaria)}</TableCell>
            <TableCell>{formatNumber(item.pronostico)}</TableCell>
            <TableCell>{formatNumber(item.rango_minimo)}</TableCell>
            <TableCell>{formatNumber(item.rango_maximo)}</TableCell>
            <TableCell>{formatNumber(item.ejecutado)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
