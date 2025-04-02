
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const HistoricalChart = ({ data }: { data: any[] }) => {
  // If no data is provided, return a message
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No hay datos disponibles para mostrar</p>
      </div>
    );
  }

  // Add debug logging to check data structure
  console.log('Data received in HistoricalChart:', data);
  console.log('First data point:', data[0]);

  const formatTime = (isoString: string): string => {
    try {
      const fecha = new Date(isoString);
      const hora = fecha.getUTCHours().toString().padStart(2, '0');
      const minutos = fecha.getUTCMinutes().toString().padStart(2, '0');
      return `${hora}:${minutos}`;
    } catch (error) {
      console.error('Error formatting time:', error, isoString);
      return 'Error';
    }
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 50, bottom: 25 }}
      >
        <XAxis
          dataKey="fecha"
          tickFormatter={formatTime}
          interval={2}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis
          domain={['auto', 'auto']}
          tickFormatter={(value) => `${value.toLocaleString()}`}
        />
        <Tooltip
          formatter={(value: any) => value ? [`${value.toLocaleString()} MW`, ''] : ['No disponible', '']}
          labelFormatter={(label) => {
            if (label) {
              try {
                const fecha = new Date(label);
                return `${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString()}`;
              } catch (error) {
                console.error('Error formatting label:', error, label);
                return String(label);
              }
            }
            return '';
          }}
        />
        <Legend verticalAlign="top" height={36} />
        
        <Line
          type="monotone"
          dataKey="demanda_programada"
          name="Demanda Programada"
          stroke="#156082"
          strokeWidth={2}
          dot={false}
          connectNulls={true}
        />
        <Line
          type="monotone"
          dataKey="reprogramacion_diaria"
          name="Reprogramación"
          stroke="#f39200"
          strokeWidth={2}
          dot={false}
          connectNulls={true}
        />
        <Line
          type="monotone"
          dataKey="prog_semanal"
          name="Prog. Semanal"
          stroke="#00C000"
          strokeWidth={2}
          dot={false}
          connectNulls={true}
        />
        <Line
          type="monotone"
          dataKey="ejecutado"
          name="Ejecutado"
          stroke="#C00000"
          strokeWidth={2}
          dot={false}
          connectNulls={true}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
