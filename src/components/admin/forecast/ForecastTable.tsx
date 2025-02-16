
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ForecastTableProps {
  data: any[];
}

export const ForecastTable = ({ data }: ForecastTableProps) => {
  const formatNumber = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '-';
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

  // Ordenamos los datos por fecha
  const sortedData = [...data].sort((a, b) => 
    new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  );

  // Encontrar el último índice con demanda real
  let lastRealDemandIndex = -1;
  for (let i = 0; i < sortedData.length; i++) {
    if (sortedData[i].demanda_real !== null) {
      lastRealDemandIndex = i;
    }
  }

  // Procesamos los datos aplicando la misma lógica que en el gráfico
  const processedData = sortedData.map((item, index) => ({
    ...item,
    pronostico_diario: index > lastRealDemandIndex ? item.pronostico_diario : null,
    rango_inferior: index > lastRealDemandIndex ? item.rango_inferior : null,
    rango_superior: index > lastRealDemandIndex ? item.rango_superior : null
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
