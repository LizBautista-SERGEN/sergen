
import { ResponsiveContainer, LineChart, Line, YAxis, Tooltip, Legend } from 'recharts';
import { format } from 'date-fns';

interface HistoricalChartProps {
  data: any[];
  startDate?: Date;
  endDate?: Date;
}

export const HistoricalChart = ({ data, startDate, endDate }: HistoricalChartProps) => {
  const filteredData = data
    .filter(item => {
      if (!startDate || !endDate) return true;
      const itemDate = new Date(item.fecha);
      return itemDate >= startDate && itemDate <= endDate;
    })
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .map(item => ({
      fecha: item.fecha,
      "Ejecutado": item.ejecutado || null,
    }));

  return (
    <ResponsiveContainer width="100%" height={550}>
      <LineChart
        data={filteredData}
        margin={{ top: 20, right: 30, left: 20, bottom: 25 }}
      >
        <YAxis
          domain={['auto', 'auto']}
          tickFormatter={(value) => `${value.toLocaleString()}`}
        />
        <Tooltip
          labelFormatter={(label) => {
            const date = new Date(label);
            return format(date, 'dd/MM/yyyy HH:mm:ss');
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
      </LineChart>
    </ResponsiveContainer>
  );
};
