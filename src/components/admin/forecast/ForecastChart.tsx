
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ForecastChartProps {
  data: any[];
  forPDF?: boolean;
}

export const ForecastChart = ({ data, forPDF = false }: ForecastChartProps) => {
  // Preparar los datos para el gráfico
  const chartData = data.map(item => ({
    time: format(new Date(item.Fecha), 'HH:mm'),
    Pronóstico: item.Pronóstico || null,
    "Rango Mínimo": item["Rango Mínimo"] || null,
    "Rango Máximo": item["Rango Máximo"] || null,
    Ejecutado: item.Ejecutado || null,
    "Reprogramación Diaria": item["Reprogramación Diaria"] || null
  }));

  console.log('Datos para el gráfico:', chartData);

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
          label={{
            value: 'Potencia (MW)',
            angle: -90,
            position: 'insideLeft',
            style: { textAnchor: 'middle' }
          }}
          tickFormatter={(value) => `${value.toLocaleString()}`}
        />
        <Tooltip
          formatter={(value: any) => value ? [`${value.toLocaleString()} MW`, ''] : ['No disponible', '']}
          labelFormatter={(label) => `Hora: ${label}`}
        />
        <Legend verticalAlign="top" height={36} />
        
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
        <Line
          type="monotone"
          dataKey="Reprogramación Diaria"
          stroke="#C00000"
          strokeWidth={2}
          dot={false}
          connectNulls={true}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
