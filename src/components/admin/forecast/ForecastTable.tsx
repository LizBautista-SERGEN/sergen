
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ForecastTableProps {
  data: any[];
}

export const ForecastTable = ({ data }: ForecastTableProps) => {
  const formatNumber = (value: number | null | undefined): string => {
    if (value === null || value === undefined || value === 0) return '-';
    return value.toLocaleString();
  };

  const formatDate = (isoString: string): string => {
    if (!isoString) return '';
    return isoString;
  };

  // Ordenamos los datos por fecha ascendente
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
        {sortedData.map((item, index) => (
          <TableRow key={index}>
            <TableCell>{formatDate(item.fecha)}</TableCell>
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
