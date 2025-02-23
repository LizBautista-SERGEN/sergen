
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

interface HistoricalChartProps {
  data: any[];
  startDate?: Date;
  endDate?: Date;
}

export const HistoricalChart = ({ data, startDate, endDate }: HistoricalChartProps) => {
  // Filtrar y ordenar los datos
  const filteredData = [...data]
    .filter(item => {
      if (!startDate || !endDate) return true;
      const itemDate = new Date(item.fecha);
      return itemDate >= startDate && itemDate <= endDate;
    })
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .map(item => ({
      fecha: item.fecha,
      "Ejecutado": item.ejecutado || null,
      "Programado": item.demanda_programada || null,
      "Reprogramación": item.reprogramacion_diaria || null,
    }));

  return (
    <ResponsiveContainer width="100%" height={550}>
      <LineChart
        data={filteredData}
        margin={{ top: 20, right: 30, left: 20, bottom: 25 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="fecha"
          tickFormatter={(value) => {
            const date = new Date(value);
            return `${date.getUTCDate().toString().padStart(2, '0')}/${(date.getUTCMonth() + 1).toString().padStart(2, '0')} ${date.getUTCHours().toString().padStart(2, '0')}:${date.getUTCMinutes().toString().padStart(2, '0')}`;
          }}
          angle={-45}
          textAnchor="end"
          height={80}
          interval={Math.ceil(filteredData.length / 15)}
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
            return `${day}/${month}/${year} ${hours}:${minutes} UTC`;
          }}
          formatter={(value: any) => [`${value?.toLocaleString() || '-'} MW`, '']}
        />
        <Legend verticalAlign="top" height={36} />
        <Line
          type="monotone"
          dataKey="Ejecutado"
          stroke="#1F497D"
          strokeWidth={2}
          dot={false}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="Programado"
          stroke="#F97316"
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
      </LineChart>
    </ResponsiveContainer>
  );
};
