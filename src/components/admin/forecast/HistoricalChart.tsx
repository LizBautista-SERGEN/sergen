
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface HistoricalChartProps {
  data: any[];
  startDate?: Date;
  endDate?: Date;
}

export const HistoricalChart = ({ data, startDate, endDate }: HistoricalChartProps) => {
  // Filtrar datos según el rango de fechas seleccionado y ordenar
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
      "Ejecutado": item.ejecutado,
    }));

  console.log('Datos filtrados y ordenados:', filteredData);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={filteredData}>
        <XAxis 
          dataKey="fecha" 
          interval={8}
          angle={-45}
          textAnchor="end"
          height={60}
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
          stroke="#0000FF"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
