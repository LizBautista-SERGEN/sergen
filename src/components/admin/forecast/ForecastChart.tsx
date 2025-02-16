
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ReferenceArea } from 'recharts';

interface ForecastChartProps {
  data: any[];
  forPDF?: boolean;
}

export const ForecastChart = ({ data, forPDF = false }: ForecastChartProps) => {
  // Preparar los datos para el gráfico
  const chartData = data.map(item => {
    const itemDate = new Date(item.fecha);
    return {
      time: format(itemDate, 'HH:mm'),
      "Reprogramación Diaria": item.reprogramacion_diaria || null,
      "Pronóstico": item.pronostico || null,
      "Rango Mínimo": item.rango_minimo || null,
      "Rango Máximo": item.rango_maximo || null,
      "Ejecutado": item.ejecutado || null,
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
          dataKey="Reprogramación Diaria"
          stroke="#C00000"
          strokeWidth={2}
          dot={false}
          connectNulls={true}
        />
        <Line
          type="monotone"
          dataKey="Pronóstico"
          stroke="#f39200"
          strokeWidth={2}
          dot={false}
          connectNulls={true}
        />
        <Line
          type="monotone"
          dataKey="Rango Mínimo"
          stroke="#90C418"
          strokeWidth={1}
          strokeDasharray="5 5"
          dot={false}
          connectNulls={true}
        />
        <Line
          type="monotone"
          dataKey="Rango Máximo"
          stroke="#90C418"
          strokeWidth={1}
          strokeDasharray="5 5"
          dot={false}
          connectNulls={true}
        />
        <Line
          type="monotone"
          dataKey="Ejecutado"
          stroke="#156082"
          strokeWidth={2}
          dot={false}
          connectNulls={true}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
