
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const HistoricalChart = ({ data }: { data: any[] }) => {
  const formatTime = (isoString: string): string => {
    const fecha = new Date(isoString);
    const hora = fecha.getUTCHours().toString().padStart(2, '0');
    const minutos = fecha.getUTCMinutes().toString().padStart(2, '0');
    return `${hora}:${minutos}`;
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
              const fecha = new Date(label);
              return `${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString()}`;
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
