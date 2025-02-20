
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface PowerChartProps {
  data: any[];
}

export const PowerChart = ({ data }: PowerChartProps) => {
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const maxValues = [...sortedData]
    .sort((a, b) => b.peak_value - a.peak_value)
    .slice(0, 2)
    .map(item => item.peak_value);

  const chartData = sortedData.map(item => ({
    date: item.date,
    value: item.peak_value,
    hora: item.peak_time,
    color: item.peak_value === maxValues[0] ? '#C00000' : 
           item.peak_value === maxValues[1] ? '#FFC000' : 
           '#1F497D'  // Nuevo color azul
  }));

  const CustomBar = (props: any) => {
    const { x, y, width, height } = props;
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
              const date = new Date(payload[0].payload.date);
              return `Fecha: ${payload[0].payload.date}\nHora: ${payload[0].payload.hora}`;
            }
            return '';
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
