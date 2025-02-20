
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
    const fecha = new Date(isoString);
    const dia = fecha.getUTCDate().toString().padStart(2, '0');
    const mes = (fecha.getUTCMonth() + 1).toString().padStart(2, '0');
    const año = fecha.getUTCFullYear();
    const hora = fecha.getUTCHours().toString().padStart(2, '0');
    const minutos = fecha.getUTCMinutes().toString().padStart(2, '0');
    const segundos = fecha.getUTCSeconds().toString().padStart(2, '0');
    
    return `${dia}/${mes}/${año} ${hora}:${minutos}:${segundos}`;
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
            <TableHead>Programado (MW)</TableHead>
            <TableHead>Reprogramación (MW)</TableHead>
            <TableHead>Prog. Semanal (MW)</TableHead>
            <TableHead>Ejecutado (MW)</TableHead>
            <TableHead>Error (%)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{formatDate(item.fecha)}</TableCell>
              <TableCell>{formatNumber(item.demanda_programada)}</TableCell>
              <TableCell>{formatNumber(item.reprogramacion_diaria)}</TableCell>
              <TableCell>{formatNumber(item.prog_semanal)}</TableCell>
              <TableCell>{formatNumber(item.ejecutado)}</TableCell>
              <TableCell>{formatNumber(item.error_porcentual)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
