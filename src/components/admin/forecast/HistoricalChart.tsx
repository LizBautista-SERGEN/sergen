
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const año = fecha.getFullYear();
    const hora = fecha.getHours().toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    
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

  console.log('Datos procesados para el gráfico:', chartData);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <XAxis 
          dataKey="time" 
          interval={2}
          angle={-45}
          textAnchor="end"
          height={60}
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
        <Legend verticalAlign="top" height={36} />
        <Line
          type="monotone"
          dataKey="Reprogramación Diaria"
          stroke="#f39200"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="Ejecutado"
          stroke="#156082"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
