
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface PowerChartProps {
  data: any[];
}

export const PowerChart = ({ data }: PowerChartProps) => {
  const chartData = data.map(item => ({
    date: format(new Date(item.date), 'dd/MM/yyyy'),
    value: item.peak_value,
    hora: format(new Date(`2000-01-01T${item.peak_time}`), 'HH:mm'),
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData}>
        <XAxis
          dataKey="date"
          interval={0}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis
          domain={[5000, 8500]}
          tickFormatter={(value) => `${value.toLocaleString()}`}
        />
        <Tooltip
          formatter={(value: any) => [`${value.toLocaleString()} MW`, 'Potencia']}
          labelFormatter={(label) => `Fecha: ${label}`}
        />
        <Bar dataKey="value" fill="#C00000" name="Potencia" />
      </BarChart>
    </ResponsiveContainer>
  );
};
