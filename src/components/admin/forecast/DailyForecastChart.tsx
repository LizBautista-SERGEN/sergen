
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import { CoesData } from '@/types/forecast';

interface DailyForecastChartProps {
  data: CoesData[];
}

export const DailyForecastChart = ({ data }: DailyForecastChartProps) => {
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'HH:mm');
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'dd/MM/yyyy HH:mm');
  };

  return (
    <div className="h-[400px] w-full mb-6">
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis 
            dataKey="fecha" 
            tickFormatter={formatTime}
          />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip 
            labelFormatter={(value) => formatDateTime(value as string)}
            formatter={(value: any) => value ? `${value} MW` : '-'}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="pronostico_diario" 
            name="Pronóstico Diario"
            stroke="#F97316" 
            strokeWidth={2}
            dot={false}
            connectNulls
          />
          <Line 
            type="monotone" 
            dataKey="demanda_real" 
            name="Demanda Real"
            stroke="#0EA5E9" 
            strokeWidth={2}
            dot={false}
            connectNulls
          />
          <Line 
            type="monotone" 
            dataKey="rango_superior" 
            name="Rango Superior"
            stroke="#00C000" 
            strokeWidth={1}
            strokeDasharray="5 5"
            dot={false}
            connectNulls
          />
          <Line 
            type="monotone" 
            dataKey="rango_inferior" 
            name="Rango Inferior"
            stroke="#00C000" 
            strokeWidth={1}
            strokeDasharray="5 5"
            dot={false}
            connectNulls
          />
          <Line 
            type="monotone" 
            dataKey="reprogramacion" 
            name="Reprogramación"
            stroke="#C00000" 
            strokeWidth={2}
            dot={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
