
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ReferenceArea } from 'recharts';

interface ForecastChartProps {
  data: any[];
  forPDF?: boolean;
}

export const ForecastChart = ({ data, forPDF = false }: ForecastChartProps) => {
  // Función para formatear la fecha manualmente sin conversiones
  const formatTime = (isoString: string): string => {
    const fecha = new Date(isoString);
    const hora = fecha.getUTCHours().toString().padStart(2, '0');
    const minutos = fecha.getUTCMinutes().toString().padStart(2, '0');
    return `${hora}:${minutos}`;
  };

  const formatFullDate = (isoString: string): string => {
    const fecha = new Date(isoString);
    const dia = fecha.getUTCDate().toString().padStart(2, '0');
    const mes = (fecha.getUTCMonth() + 1).toString().padStart(2, '0');
    const año = fecha.getUTCFullYear();
    const hora = fecha.getUTCHours().toString().padStart(2, '0');
    const minutos = fecha.getUTCMinutes().toString().padStart(2, '0');
    
    return `${dia}/${mes}/${año} ${hora}:${minutos}`;
  };

  // Ordenamos los datos por fecha
  const sortedData = [...data].sort((a, b) => 
    new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  );

  // Encontrar el último punto con demanda real
  const lastRealDemandIndex = sortedData.reduce((lastIndex, item, currentIndex) => {
    if (item.demanda_real !== null) {
      return currentIndex;
    }
    return lastIndex;
  }, -1);

  console.log('Último índice con demanda real:', lastRealDemandIndex);

  const chartData = sortedData.map((item, index) => {
    const currentDate = new Date(item.fecha);
    const hora = currentDate.getUTCHours();

    // Mostrar pronóstico y rangos solo después del último punto de demanda real
    const showForecast = index > lastRealDemandIndex;

    return {
      time: formatTime(item.fecha),
      "Reprogramación": item.reprogramacion || null,
      "Pronóstico Diario": showForecast ? item.pronostico_diario : null,
      "Rango Inferior": showForecast ? item.rango_inferior : null,
      "Rango Superior": showForecast ? item.rango_superior : null,
      "Demanda Real": item.demanda_real || null,
      hora: hora,
      fecha_completa: formatFullDate(item.fecha)
    };
  });

  console.log('Datos procesados del gráfico:', chartData);

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
          labelFormatter={(label, payload) => {
            if (payload && payload[0]) {
              return `${payload[0].payload.fecha_completa}`;
            }
            return label;
          }}
        />
        <Legend verticalAlign="top" height={36} />

        {/* Áreas grises para horas pico */}
        {chartData.map((entry, index) => {
          if (entry.hora >= 18 && entry.hora < 23 && index < chartData.length - 1) {
            return (
              <ReferenceArea
                key={`area-${index}`}
                x1={entry.time}
                x2={chartData[index + 1].time}
                fill="#E8E8E8"
                fillOpacity={0.8}
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
