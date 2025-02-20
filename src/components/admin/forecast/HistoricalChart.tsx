
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface HistoricalChartProps {
  data: any[];
  startDate?: Date;
  endDate?: Date;
}

export const HistoricalChart = ({ data, startDate, endDate }: HistoricalChartProps) => {
  const filteredData = [...data]
    .filter(item => {
      if (!startDate || !endDate) return true;
      
      const itemDate = new Date(item.fecha);
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Establecer las horas en UTC
      start.setUTCHours(0, 0, 0, 0);
      end.setUTCHours(23, 59, 59, 999);
      
      return itemDate >= start && itemDate <= end;
    })
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .map(item => ({
      fecha: item.fecha,
      "Ejecutado": item.ejecutado,
    }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={filteredData}>
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
          formatter={(value: any) => [
            `${value.toLocaleString()} MW`,
            'Ejecutado'
          ]}
        />
        <Line
          type="monotone"
          dataKey="Ejecutado"
          stroke="#1F497D"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
