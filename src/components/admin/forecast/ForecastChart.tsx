
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceArea } from 'recharts';

interface ForecastChartProps {
  data: any[];
  forPDF?: boolean;
}

export const ForecastChart = ({ data, forPDF = false }: ForecastChartProps) => {
  const chartData = [...data]
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .map(item => {
      const hora = new Date(item.fecha).getHours();
      return {
        fecha: item.fecha,
        "Reprogramación": item.reprogramacion || null,
        "Pronóstico Diario": item.pronostico_diario || null,
        "Rango Inferior": item.rango_inferior || null,
        "Rango Superior": item.rango_superior || null,
        "Demanda Real": item.demanda_real || null,
        isPeakHour: hora >= 18 && hora <= 23
      };
    });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={forPDF ? { top: 20, right: 30, left: 20, bottom: 5 } : { top: 5, right: 30, left: 20, bottom: 25 }}
      >
        <XAxis
          dataKey="fecha"
          hide={true}
        />
        <YAxis
          domain={[5000, 8500]}
          tickFormatter={(value) => `${value.toLocaleString()}`}
        />
        {chartData.map((entry, index) => {
          if (entry.isPeakHour && index < chartData.length - 1) {
            return (
              <ReferenceArea
                key={`peak-${index}`}
                x1={entry.fecha}
                x2={chartData[index + 1].fecha}
                fill="#F2F2F2"
                fillOpacity={0.5}
              />
            );
          }
          return null;
        })}
        <Tooltip
          labelFormatter={(label) => label}
          formatter={(value: any) => [`${value?.toLocaleString() || '-'} MW`, '']}
        />
        <Legend verticalAlign="top" height={36} />
        <Line
          type="monotone"
          dataKey="Demanda Real"
          stroke="#1F497D"
          strokeWidth={2}
          dot={false}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="Reprogramación"
          stroke="#C00000"
          strokeWidth={2}
          dot={false}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="Pronóstico Diario"
          stroke="#F97316"
          strokeWidth={2}
          dot={false}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="Rango Superior"
          stroke="#82ca9d"
          strokeWidth={1}
          strokeDasharray="3 3"
          dot={false}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="Rango Inferior"
          stroke="#82ca9d"
          strokeWidth={1}
          strokeDasharray="3 3"
          dot={false}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
