
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
          <TableHead>Programado</TableHead>
          <TableHead>Pronóstico</TableHead>
          <TableHead>Rango Mínimo</TableHead>
          <TableHead>Rango Máximo</TableHead>
          <TableHead>Ejecutado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, index) => (
          <TableRow key={index}>
            <TableCell>{format(new Date(item.Fecha), 'dd/MM/yyyy HH:mm')}</TableCell>
            <TableCell>{item["Reprogramación Diaria"] ? `${formatNumber(item["Reprogramación Diaria"])} MW` : '-'}</TableCell>
            <TableCell>{item["Pronóstico"] ? `${formatNumber(item["Pronóstico"])} MW` : '-'}</TableCell>
            <TableCell>{item["Rango Mínimo"] ? `${formatNumber(item["Rango Mínimo"])} MW` : '-'}</TableCell>
            <TableCell>{item["Rango Máximo"] ? `${formatNumber(item["Rango Máximo"])} MW` : '-'}</TableCell>
            <TableCell>{item["Ejecutado"] ? `${formatNumber(item["Ejecutado"])} MW` : '-'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
