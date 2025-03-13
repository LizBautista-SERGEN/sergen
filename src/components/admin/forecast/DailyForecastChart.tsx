
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CoesData } from '@/types/forecast';

interface DailyForecastChartProps {
  data: CoesData[];
}

export const DailyForecastChart = ({ data }: DailyForecastChartProps) => {
  const formatTime = (dateStr: string) => {
    return dateStr.split('T')[1].substring(0, 5);
  };

  const formatDateTime = (dateStr: string) => {
    return dateStr.replace('T', ' ').substring(0, 16);
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
            dataKey="pronostico" 
            name="Pronóstico"
            stroke="#F97316" 
            strokeWidth={2}
            dot={false}
            connectNulls
          />
          <Line 
            type="monotone" 
            dataKey="ejecutado" 
            name="Ejecutado"
            stroke="#0036A2" 
            strokeWidth={2}
            dot={false}
            connectNulls
          />
          <Line 
            type="monotone" 
            dataKey="rango_inferior" 
            name="Límite Inferior"
            stroke="#00C000" 
            strokeWidth={1}
            strokeDasharray="5 5"
            dot={false}
            connectNulls
          />
          <Line 
            type="monotone" 
            dataKey="rango_superior" 
            name="Límite Superior"
            stroke="#00C000" 
            strokeWidth={1}
            strokeDasharray="5 5"
            dot={false}
            connectNulls
          />
          <Line 
            type="monotone" 
            dataKey="reprogramado" 
            name="Reprogramado"
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
