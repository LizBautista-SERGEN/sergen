
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ForecastChartProps {
  data: any[];
  forPDF?: boolean;
}

export const ForecastChart = ({ data, forPDF = false }: ForecastChartProps) => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const chartData = [...data]
    .filter(item => {
      const itemDate = new Date(item.fecha);
      itemDate.setUTCHours(0, 0, 0, 0);
      return itemDate.getTime() === today.getTime();
    })
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .map(item => ({
      fecha: item.fecha,
      "Reprogramación": item.reprogramacion || null,
      "Pronóstico Diario": item.pronostico_diario || null,
      "Rango Inferior": item.rango_inferior || null,
      "Rango Superior": item.rango_superior || null,
      "Demanda Real": item.demanda_real || null,
    }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={forPDF ? { top: 20, right: 30, left: 20, bottom: 5 } : { top: 5, right: 30, left: 20, bottom: 25 }}
      >
        <XAxis
          dataKey="fecha"
          hide={true}
        />
        <YAxis
          domain={[5000, 8500]}
          tickFormatter={(value) => `${value.toLocaleString()}`}
        />
        <Tooltip
          labelFormatter={(label) => {
            const date = new Date(label);
            const day = date.getUTCDate().toString().padStart(2, '0');
            const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
            const year = date.getUTCFullYear();
            const hours = date.getUTCHours().toString().padStart(2, '0');
            const minutes = date.getUTCMinutes().toString().padStart(2, '0');
            return `${day}/${month}/${year} ${hours}:${minutes}`;
          }}
          formatter={(value: any) => [`${value?.toLocaleString() || '-'} MW`, '']}
        />
        <Legend verticalAlign="top" height={36} />
        <Line
          type="monotone"
          dataKey="Demanda Real"
          stroke="#1F497D"
          strokeWidth={2}
          dot={false}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="Reprogramación"
          stroke="#C00000"
          strokeWidth={2}
          dot={false}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="Pronóstico Diario"
          stroke="#F97316"
          strokeWidth={2}
          dot={false}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="Rango Superior"
          stroke="#82ca9d"
          strokeWidth={1}
          strokeDasharray="3 3"
          dot={false}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="Rango Inferior"
          stroke="#82ca9d"
          strokeWidth={1}
          strokeDasharray="3 3"
          dot={false}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
