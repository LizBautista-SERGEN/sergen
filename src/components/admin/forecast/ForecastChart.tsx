
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ForecastChartProps {
  data: any[];
  forPDF?: boolean;
}

export const ForecastChart = ({ data, forPDF = false }: ForecastChartProps) => {
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

  // Procesamos los datos para el gráfico, reemplazando valores 0 por null
  const chartData = data.map(item => ({
    time: formatTime(item.fecha),
    fecha_completa: formatFullDate(item.fecha),
    "Reprogramación": item.reprogramacion === 0 ? null : item.reprogramacion,
    "Pronóstico Diario": item.pronostico_diario === 0 ? null : item.pronostico_diario,
    "Rango Inferior": item.rango_inferior === 0 ? null : item.rango_inferior,
    "Rango Superior": item.rango_superior === 0 ? null : item.rango_superior,
    "Demanda Real": item.demanda_real === 0 ? null : item.demanda_real,
    hora: new Date(item.fecha).getHours(),
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={forPDF ? { top: 20, right: 30, left: 20, bottom: 5 } : undefined}
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
