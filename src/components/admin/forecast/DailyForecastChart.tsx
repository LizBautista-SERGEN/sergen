
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

  // Preprocesamiento para solucionar problemas con la serie "ejecutado"
  const createIndependentSeries = () => {
    // Primero creamos un mapa con todas las fechas
    const fechaMap = new Map<string, any>();
    
    // Inicializamos todas las fechas con valores nulos para todas las series
    data.forEach(item => {
      fechaMap.set(item.fecha, {
        fecha: item.fecha,
        pronostico: null,
        rango_inferior: null,
        rango_superior: null,
        reprogramado: null,
        ejecutado: null
      });
    });
    
    // Ahora llenamos con los valores reales
    data.forEach(item => {
      const entry = fechaMap.get(item.fecha);
      if (entry) {
        entry.pronostico = item.pronostico;
        entry.rango_inferior = item.rango_inferior;
        entry.rango_superior = item.rango_superior;
        entry.reprogramado = item.reprogramado;
        entry.ejecutado = item.ejecutado;
      }
    });
    
    // Convertimos el mapa de vuelta a un array
    return Array.from(fechaMap.values());
  };

  // Usar datos preprocesados para asegurar que cada serie sea independiente
  const processedData = createIndependentSeries();
  
  console.log('Datos procesados para la gráfica:', processedData);

  return (
    <div className="h-[400px] w-full mb-6">
      <ResponsiveContainer>
        <LineChart 
          data={processedData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
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
          
          {/* Renderizamos cada serie por separado y en un orden específico para controlar la visualización */}
          <Line 
            type="monotone" 
            dataKey="rango_inferior" 
            name="Límite Inferior"
            stroke="#00C000" 
            strokeWidth={1}
            strokeDasharray="5 5"
            dot={false}
            isAnimationActive={false}
            connectNulls={true}
          />
          <Line 
            type="monotone" 
            dataKey="rango_superior" 
            name="Límite Superior"
            stroke="#00C000" 
            strokeWidth={1}
            strokeDasharray="5 5"
            dot={false}
            isAnimationActive={false}
            connectNulls={true}
          />
          <Line 
            type="monotone" 
            dataKey="pronostico" 
            name="Pronóstico"
            stroke="#F97316" 
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            connectNulls={true}
          />
          <Line 
            type="monotone" 
            dataKey="reprogramado" 
            name="Reprogramado"
            stroke="#C00000" 
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            connectNulls={true}
          />
          {/* Colocamos esta línea al final para que se renderice por encima de las demás */}
          <Line 
            type="monotone" 
            dataKey="ejecutado" 
            name="Ejecutado"
            stroke="#0036A2" 
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5 }}
            isAnimationActive={false}
            connectNulls={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
