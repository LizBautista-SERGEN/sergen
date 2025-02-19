
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from "date-fns";

interface HistoricalChartProps {
  data: any[];
  startDate?: Date;
  endDate?: Date;
}

export const HistoricalChart = ({ data, startDate, endDate }: HistoricalChartProps) => {
  // Filtrar datos según el rango de fechas seleccionado
  const filteredData = data.filter(item => {
    const itemDate = new Date(item.fecha);
    if (startDate && endDate) {
      return itemDate >= startDate && itemDate <= endDate;
    }
    return true;
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={filteredData}>
        <XAxis 
          dataKey="fecha" 
          tickFormatter={(value) => format(new Date(value), 'dd/MM/yyyy')}
          hide={true}
        />
        <YAxis 
          domain={[5000, 8500]}
          tickFormatter={(value) => `${value.toLocaleString()}`}
        />
        <Tooltip
          labelFormatter={(label) => format(new Date(label), 'dd/MM/yyyy HH:mm')}
          formatter={(value: any) => [`${value.toLocaleString()} MW`, '']}
        />
        <Line
          type="monotone"
          dataKey="reprogramacion_diaria"
          stroke="#f39200"
          strokeWidth={2}
          dot={false}
          name="Reprogramación Diaria"
        />
        <Line
          type="monotone"
          dataKey="ejecutado"
          stroke="#156082"
          strokeWidth={2}
          dot={false}
          name="Ejecutado"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
