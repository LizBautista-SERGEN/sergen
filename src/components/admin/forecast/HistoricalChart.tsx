
import { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { format } from 'date-fns';

interface HistoricalChartProps {
  data: any[];
  startDate?: Date;
  endDate?: Date;
}

export const HistoricalChart = ({ data, startDate, endDate }: HistoricalChartProps) => {
  const [opacity, setOpacity] = useState({
    ejecutado: 1,
    programado: 1,
    reprogramacion: 1
  });

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    // Formateamos la fecha en UTC
    return format(date, 'dd/MM/yyyy HH:mm', { timeZone: 'UTC' });
  };

  const handleMouseEnter = (o: any) => {
    const { dataKey } = o;
    setOpacity({
      ...opacity,
      [dataKey]: 0.5
    });
  };

  const handleMouseLeave = (o: any) => {
    const { dataKey } = o;
    setOpacity({
      ...opacity,
      [dataKey]: 1
    });
  };

  // Filtrar y ordenar los datos
  const filteredData = [...data]
    .filter(item => {
      if (!startDate || !endDate) return true;
      const itemDate = new Date(item.fecha);
      return itemDate >= startDate && itemDate <= endDate;
    })
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .map(item => ({
      ...item,
      fecha: formatDate(item.fecha)
    }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={filteredData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="fecha"
          angle={-45}
          textAnchor="end"
          height={80}
          interval={Math.ceil(filteredData.length / 15)}
        />
        <YAxis domain={['auto', 'auto']} />
        <Tooltip />
        <Legend
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
        <Line
          type="monotone"
          dataKey="ejecutado"
          name="Ejecutado"
          stroke="#8884d8"
          strokeOpacity={opacity.ejecutado}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="demanda_programada"
          name="Programado"
          stroke="#82ca9d"
          strokeOpacity={opacity.programado}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="reprogramacion_diaria"
          name="Reprogramación"
          stroke="#ffc658"
          strokeOpacity={opacity.reprogramacion}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
