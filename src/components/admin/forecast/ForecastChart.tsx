
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { parse, format } from 'date-fns';

interface ForecastChartProps {
  data: any[];
  forPDF?: boolean;
}

export const ForecastChart = ({ data, forPDF = false }: ForecastChartProps) => {
  const parseDate = (dateStr: string) => {
    try {
      return new Date(dateStr);
    } catch (error) {
      console.error('Error parsing date:', dateStr, error);
      return null;
    }
  };

  const formatTime = (dateStr: string): string => {
    const date = parseDate(dateStr);
    if (!date) return '';
    return format(date, 'HH:mm');
  };

  const formatFullDate = (dateStr: string): string => {
    const date = parseDate(dateStr);
    if (!date) return '';
    return format(date, 'dd/MM/yyyy HH:mm');
  };

  // Procesamos y ordenamos los datos por fecha
  const chartData = data
    .map(item => ({
      time: formatTime(item.fecha),
      fecha_completa: formatFullDate(item.fecha),
      fecha: new Date(item.fecha), // para ordenar
      "Reprogramación": item.reprogramacion || null,
      "Pronóstico Diario": item.pronostico_diario || null,
      "Rango Inferior": item.rango_inferior || null,
      "Rango Superior": item.rango_superior || null,
      "Demanda Real": item.demanda_real || null,
    }))
    .sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

  console.log('Datos procesados para el gráfico:', chartData);

  if (chartData.length === 0) {
    console.warn('No hay datos para mostrar en el gráfico');
    return <div>No hay datos disponibles</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={forPDF ? { top: 20, right: 30, left: 20, bottom: 5 } : { top: 5, right: 30, left: 20, bottom: 25 }}
      >
        <XAxis
          dataKey="time"
          interval={1}
          angle={-45}
          textAnchor="end"
          height={60}
          scale="point"
          padding={{ left: 0, right: 0 }}
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
          formatter={(value: any) => [`${value?.toLocaleString() || '-'} MW`, '']}
        />
        <Legend verticalAlign="top" height={36} />
        <Line
          type="monotone"
          dataKey="Demanda Real"
          stroke="#C00000"
          strokeWidth={2}
          dot={false}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="Reprogramación"
          stroke="#f39200"
          strokeWidth={2}
          dot={false}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="Pronóstico Diario"
          stroke="#82ca9d"
          strokeWidth={2}
          dot={false}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="Rango Superior"
          stroke="#d9d9d9"
          strokeWidth={1}
          strokeDasharray="3 3"
          dot={false}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="Rango Inferior"
          stroke="#d9d9d9"
          strokeWidth={1}
          strokeDasharray="3 3"
          dot={false}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
