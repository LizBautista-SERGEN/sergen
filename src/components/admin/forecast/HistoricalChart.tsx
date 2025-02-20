
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface HistoricalChartProps {
  data: any[];
  startDate?: Date;
  endDate?: Date;
}

export const HistoricalChart = ({ data, startDate, endDate }: HistoricalChartProps) => {
  const formatTime = (isoString: string): string => {
    if (!isoString) return '';
    const fecha = new Date(isoString);
    const hora = fecha.getHours().toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    return `${hora}:${minutos}`;
  };

  const formatFullDate = (isoString: string): string => {
    if (!isoString) return '';
    const fecha = new Date(isoString);
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(fecha);
  };

  // Filtrar datos según el rango de fechas seleccionado
  const filteredData = data.filter(item => {
    const itemDate = new Date(item.fecha);
    if (startDate && endDate) {
      return itemDate >= startDate && itemDate <= endDate;
    }
    return true;
  });

  const chartData = filteredData.map(item => ({
    time: formatTime(item.fecha),
    fecha_completa: formatFullDate(item.fecha),
    "Ejecutado": item.ejecutado,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <XAxis 
          dataKey="time" 
          interval={8}  // Aumentado el intervalo para reducir superposición
          angle={-45}
          textAnchor="end"
          height={60}
          hide  // Ocultando las etiquetas del eje X
        />
        <YAxis 
          domain={[5000, 8500]}
          tickFormatter={(value) => `${value.toLocaleString()}`}
        />
        <Tooltip
          labelFormatter={(label, payload) => {
            if (payload && payload[0]) {
              return payload[0].payload.fecha_completa;
            }
            return label;
          }}
          formatter={(value: any) => [
            `${value.toLocaleString()} MW`,
            'Ejecutado'
          ]}
        />
        <Line
          type="monotone"
          dataKey="Ejecutado"
          stroke="#0000FF"  // Cambiado a azul
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
