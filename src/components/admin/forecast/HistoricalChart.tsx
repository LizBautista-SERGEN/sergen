
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface HistoricalChartProps {
  data: any[];
  startDate?: Date;
  endDate?: Date;
}

export const HistoricalChart = ({ data, startDate, endDate }: HistoricalChartProps) => {
  const filteredData = [...data]
    .filter(item => {
      const itemDate = new Date(item.fecha);
      if (startDate && endDate) {
        return itemDate >= startDate && itemDate <= endDate;
      }
      return true;
    })
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .map(item => ({
      fecha: item.fecha,
      fecha_formateada: format(new Date(item.fecha), 'dd/MM/yyyy HH:mm'),
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
          labelFormatter={(label, payload) => {
            if (payload && payload[0]) {
              return payload[0].payload.fecha_formateada;
            }
            return '';
          }}
          formatter={(value: any) => [
            `${value.toLocaleString()} MW`,
            'Ejecutado'
          ]}
        />
        <Line
          type="monotone"
          dataKey="Ejecutado"
          stroke="#0FA0CE"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
