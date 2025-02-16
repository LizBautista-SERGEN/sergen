
import { format, parse } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ReferenceArea } from 'recharts';

interface ForecastChartProps {
  data: any[];
  forPDF?: boolean;
}

export const ForecastChart = ({ data, forPDF = false }: ForecastChartProps) => {
  // Encontrar la última fecha con dato ejecutado
  const lastExecutedIndex = [...data].reverse().findIndex(item => item.ejecutado !== null && item.ejecutado !== 0);
  const lastExecutedDate = lastExecutedIndex !== -1 
    ? data[data.length - 1 - lastExecutedIndex].fecha 
    : null;

  // Preparar los datos para el gráfico
  const chartData = data.map(item => {
    const itemDate = new Date(item.fecha);
    const itemTime = format(itemDate, 'HH:mm');
    const isAfterLastExecuted = lastExecutedDate && new Date(item.fecha) > new Date(lastExecutedDate);

    return {
      time: itemTime,
      Pronóstico: isAfterLastExecuted ? (item.pronostico || null) : null,
      "Rango Mínimo": isAfterLastExecuted ? (item.rango_minimo || null) : null,
      "Rango Máximo": isAfterLastExecuted ? (item.rango_maximo || null) : null,
      Ejecutado: item.ejecutado || null,
      "Reprogramación Diaria": item.reprogramacion_diaria || null,
      hora: parseInt(format(itemDate, 'H')),
    };
  });

  // Crear áreas de referencia para las horas pico (18:00 - 23:00)
  const referenceAreas = [];
  const uniqueDates = [...new Set(data.map(item => format(new Date(item.fecha), 'yyyy-MM-dd')))];
  
  uniqueDates.forEach(date => {
    referenceAreas.push({
      start: `${date} 18:00`,
      end: `${date} 23:00`
    });
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
