
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartData } from './types';

interface HistoricalPowerChartProps {
  chartData: ChartData[];
}

export const HistoricalPowerChart = ({ chartData }: HistoricalPowerChartProps) => {
  const formatTooltip = (value: number, name: string, props: { payload: ChartData }) => {
    return [`${value.toFixed(2)} MW`, 'Potencia Máxima'];
  };

  const formatTooltipLabel = (label: string, payload: { payload: ChartData }[]) => {
    if (payload && payload.length > 0) {
      const data = payload[0].payload;
      // Extract time from the ISO string
      const fullDate = new Date(data.fullDate);
      const hours = fullDate.getUTCHours().toString().padStart(2, '0');
      const minutes = fullDate.getUTCMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;
      
      return `Fecha: ${label} | Hora: ${timeString}`;
    }
    return `Fecha: ${label}`;
  };

  return (
    <ResponsiveContainer width="100%" height={390}>
      <BarChart 
        data={chartData} 
        margin={{ top: 5, right: 20, bottom: 20, left: 20 }}
      >
        <XAxis 
          dataKey="date" 
          angle={-45}
          textAnchor="end"
          height={50}
          interval={chartData.length > 30 ? Math.ceil(chartData.length / 30) : 0}
          fontSize={10}
        />
        <YAxis 
          domain={[4000, 'auto']}
        />
        <Tooltip 
          formatter={formatTooltip}
          labelFormatter={formatTooltipLabel}
        />
        <Bar dataKey="value" name="Potencia Máxima">
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
