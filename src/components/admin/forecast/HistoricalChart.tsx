
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
      
      // Usar las fechas exactas sin modificaciones
      const itemDate = new Date(item.fecha);
      const start = new Date(startDate.setHours(0, 0, 0, 0));
      const end = new Date(endDate.setHours(23, 59, 59, 999));
      
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
          labelFormatter={(label) => label}
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
