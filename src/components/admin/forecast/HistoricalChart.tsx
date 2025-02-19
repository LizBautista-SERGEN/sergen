
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface HistoricalChartProps {
  data: any[];
  startDate?: Date;
  endDate?: Date;
}

export const HistoricalChart = ({ data, startDate, endDate }: HistoricalChartProps) => {
  // Función para formatear la fecha manualmente sin conversiones
  const formatTime = (isoString: string): string => {
    const fecha = new Date(isoString);
    const hora = fecha.getUTCHours().toString().padStart(2, '0');
    const minutos = fecha.getUTCMinutes().toString().padStart(2, '0');
    return `${hora}:${minutos}`;
  };

  const formatFullDate = (isoString: string): string => {
    const fecha = new Date(isoString);
    const dia = fecha.getUTCDate().toString().padStart(2, '0');
    const mes = (fecha.getUTCMonth() + 1).toString().padStart(2, '0');
    const año = fecha.getUTCFullYear();
    const hora = fecha.getUTCHours().toString().padStart(2, '0');
    const minutos = fecha.getUTCMinutes().toString().padStart(2, '0');
    
    return `${dia}/${mes}/${año} ${hora}:${minutos}`;
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
    "Reprogramación Diaria": item.reprogramacion_diaria,
    "Ejecutado": item.ejecutado
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <XAxis 
          dataKey="time" 
          hide={true}
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
          formatter={(value: any) => [`${value.toLocaleString()} MW`, '']}
        />
        <Line
          type="monotone"
          dataKey="Reprogramación Diaria"
          stroke="#f39200"
          strokeWidth={2}
          dot={false}
          name="Reprogramación Diaria"
        />
        <Line
          type="monotone"
          dataKey="Ejecutado"
          stroke="#156082"
          strokeWidth={2}
          dot={false}
          name="Ejecutado"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
