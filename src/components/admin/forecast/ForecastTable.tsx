
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ForecastTableProps {
  data: any[];
}

export const ForecastTable = ({ data }: ForecastTableProps) => {
  const formatNumber = (value: number | null | undefined): string => {
    if (value === null || value === undefined || value === 0) return '-';
    return value.toLocaleString();
  };

  // Función para formatear la fecha manualmente sin conversiones
  const formatDate = (isoString: string): string => {
    // La fecha viene en formato ISO, ejemplo: "2024-02-16T05:30:00+00:00"
    const fecha = new Date(isoString);
    const dia = fecha.getUTCDate().toString().padStart(2, '0');
    const mes = (fecha.getUTCMonth() + 1).toString().padStart(2, '0');
    const año = fecha.getUTCFullYear();
    const hora = fecha.getUTCHours().toString().padStart(2, '0');
    const minutos = fecha.getUTCMinutes().toString().padStart(2, '0');
    
    return `${dia}/${mes}/${año} ${hora}:${minutos}`;
  };

  // Función para validar si un valor es efectivamente nulo o cero
  const isNullOrZero = (value: any): boolean => {
    return value === null || value === undefined || value === 0;
  };

  // Ordenamos los datos por fecha
  const sortedData = [...data].sort((a, b) => 
    new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  );

  // Encontrar el último índice con demanda real (excluyendo ceros)
  let lastRealDemandIndex = -1;
  for (let i = 0; i < sortedData.length; i++) {
    if (!isNullOrZero(sortedData[i].demanda_real)) {
      lastRealDemandIndex = i;
    }
  }

  // Procesamos los datos aplicando la misma lógica que en el gráfico
  const processedData = sortedData.map((item, index) => ({
    ...item,
    pronostico_diario: index > lastRealDemandIndex && !isNullOrZero(item.pronostico_diario) ? item.pronostico_diario : null,
    rango_inferior: index > lastRealDemandIndex && !isNullOrZero(item.rango_inferior) ? item.rango_inferior : null,
    rango_superior: index > lastRealDemandIndex && !isNullOrZero(item.rango_superior) ? item.rango_superior : null,
    demanda_real: isNullOrZero(item.demanda_real) ? null : item.demanda_real
  }));

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
        {processedData.map((item, index) => (
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
