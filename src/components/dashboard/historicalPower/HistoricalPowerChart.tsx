
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartData } from './types';

interface HistoricalPowerChartProps {
  chartData: ChartData[];
}

export const HistoricalPowerChart = ({ chartData }: HistoricalPowerChartProps) => {
  const formatTooltip = (value: number) => {
    return [`${value.toFixed(2)} MW`, 'Potencia Máxima'];
  };

  return (
    <ResponsiveContainer width="100%" height={390}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 20, left: 20 }}>
        <XAxis 
          dataKey="date" 
          angle={-45}
          textAnchor="end"
          height={50}
        />
        <YAxis 
          domain={[4000, 'auto']}
        />
        <Tooltip 
          formatter={formatTooltip}
          labelFormatter={(label) => `Fecha: ${label}`}
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
