
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface HistoricalDataTableProps {
  data: any[];
}

export const HistoricalDataTable = ({ data }: HistoricalDataTableProps) => {
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
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Ejecutado (MW)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{formatDate(item.fecha)}</TableCell>
              <TableCell>{formatNumber(item.ejecutado)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
