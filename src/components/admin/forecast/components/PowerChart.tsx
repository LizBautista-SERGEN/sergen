
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface PowerChartProps {
  data: any[];
}

export const PowerChart = ({ data }: PowerChartProps) => {
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Encontrar los dos valores más altos
  const maxValues = [...sortedData]
    .sort((a, b) => b.peak_value - a.peak_value)
    .slice(0, 2)
    .map(item => item.peak_value);

  const chartData = sortedData.map(item => ({
    date: item.date,
    value: item.peak_value,
    hora: item.peak_time,
    // Determinar el color de la barra
    color: item.peak_value === maxValues[0] ? '#C00000' : // rojo para el más alto
           item.peak_value === maxValues[1] ? '#FFC000' : // naranja para el segundo más alto
           '#1F497D' // azul para el resto
  }));

  const CustomBar = (props: any) => {
    const { fill, x, y, width, height } = props;
    const color = props.payload.color;
    return <rect x={x} y={y} width={width} height={height} fill={color} />;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData}>
        <XAxis
          dataKey="date"
          hide={true}
        />
        <YAxis
          domain={[5000, 8500]}
          tickFormatter={(value) => `${value.toLocaleString()}`}
        />
        <Tooltip
          formatter={(value: any) => [`${value.toLocaleString()} MW`, 'Potencia']}
          labelFormatter={(label, payload) => {
            if (payload && payload[0]) {
              return `Fecha: ${payload[0].payload.date}\nHora: ${payload[0].payload.hora}`;
            }
            return label;
          }}
        />
        <Bar 
          dataKey="value" 
          name="Potencia"
          shape={<CustomBar />}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
