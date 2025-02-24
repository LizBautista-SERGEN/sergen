
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';
import { CoesData } from '@/types/forecast';

interface DailyForecastChartProps {
  data: CoesData[];
}

export const DailyForecastChart = ({ data }: DailyForecastChartProps) => {
  return (
    <div className="h-[400px] w-full mb-6">
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis 
            dataKey="fecha" 
            tickFormatter={(value) => format(parseISO(value), 'HH:mm')}
          />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip 
            labelFormatter={(value) => format(parseISO(value as string), 'dd/MM/yyyy HH:mm')}
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
