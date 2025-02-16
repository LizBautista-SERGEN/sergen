
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ReferenceArea } from 'recharts';

interface ForecastChartProps {
  data: any[];
  forPDF?: boolean;
}

export const ForecastChart = ({ data, forPDF = false }: ForecastChartProps) => {
  const chartData = data.map(item => {
    const itemDate = new Date(item.fecha);
    return {
      time: format(itemDate, 'HH:mm'),
      "Reprogramación": item.reprogramacion || null,
      "Pronóstico Diario": item.pronostico_diario || null,
      "Rango Inferior": item.rango_inferior || null,
      "Rango Superior": item.rango_superior || null,
      "Demanda Real": item.demanda_real || null,
      hora: parseInt(format(itemDate, 'H')),
    };
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 30, left: 50, bottom: 25 }}
      >
        <XAxis
          dataKey="time"
          interval={2}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis
          domain={[6000, 9000]}
          tickFormatter={(value) => `${value.toLocaleString()}`}
        />
        <Tooltip
          formatter={(value: any) => value ? [`${value.toLocaleString()} MW`, ''] : ['No disponible', '']}
          labelFormatter={(label) => `Hora: ${label}`}
        />
        <Legend verticalAlign="top" height={36} />

        {/* Áreas grises para horas pico */}
        {chartData.map((entry, index) => {
          if (entry.hora >= 18 && entry.hora <= 23 && index < chartData.length - 1) {
            return (
              <ReferenceArea
                key={`area-${index}`}
                x1={entry.time}
                x2={chartData[index + 1].time}
                fill="#gray"
                fillOpacity={0.1}
              />
            );
          }
          return null;
        })}
        
        <Line
          type="monotone"
          dataKey="Reprogramación"
          stroke="#C00000"
          strokeWidth={2}
          dot={false}
          connectNulls={true}
        />
        <Line
          type="monotone"
          dataKey="Pronóstico Diario"
          stroke="#f39200"
          strokeWidth={2}
          dot={false}
          connectNulls={true}
        />
        <Line
          type="monotone"
          dataKey="Rango Inferior"
          stroke="#90C418"
          strokeWidth={1}
          strokeDasharray="5 5"
          dot={false}
          connectNulls={true}
        />
        <Line
          type="monotone"
          dataKey="Rango Superior"
          stroke="#90C418"
          strokeWidth={1}
          strokeDasharray="5 5"
          dot={false}
          connectNulls={true}
        />
        <Line
          type="monotone"
          dataKey="Demanda Real"
          stroke="#156082"
          strokeWidth={2}
          dot={false}
          connectNulls={true}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
