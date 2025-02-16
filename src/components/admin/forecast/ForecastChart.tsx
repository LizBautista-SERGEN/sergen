
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Area, ComposedChart, ReferenceArea } from 'recharts';

interface ForecastChartProps {
  data: any[];
  forPDF?: boolean;
}

export const ForecastChart = ({ data, forPDF = false }: ForecastChartProps) => {
  // Identificar todas las fechas únicas para las áreas sombreadas de horas punta
  const uniqueDates = [...new Set(data.map(item => format(new Date(item.Fecha), 'yyyy-MM-dd')))];
  const peakHourRanges = uniqueDates.map(date => ({
    start: `${date}T18:00:00`,
    end: `${date}T23:00:00`
  }));

  return (
    <ComposedChart
      width={800}
      height={400}
      data={data}
      margin={forPDF ? { top: 60, right: 30, left: 50, bottom: 30 } : { top: 30, right: 30, left: 50, bottom: 30 }}
    >
      <Legend 
        verticalAlign={forPDF ? "top" : "bottom"}
        align="center"
        wrapperStyle={forPDF ? { top: 10 } : undefined}
      />
      {peakHourRanges.map((range, index) => (
        <ReferenceArea
          key={index}
          x1={range.start}
          x2={range.end}
          fill="#00000010"
          fillOpacity={0.3}
        />
      ))}
      <XAxis
        dataKey="Fecha"
        tickFormatter={(value) => format(new Date(value), 'HH:mm')}
      />
      <YAxis
        domain={[6000, 9000]}
        tickFormatter={(value) => `${value.toLocaleString()}`}
      />
      <Tooltip
        labelFormatter={(label) => format(new Date(label), 'dd/MM/yyyy HH:mm')}
        formatter={(value: any) => value !== null ? [`${value.toLocaleString()} MW`, ''] : ['-', '']}
      />
      <Area
        type="monotone"
        dataKey="Rango Máximo"
        fill="#90C41833"
        fillOpacity={0.3}
        stroke="#90C418"
        strokeWidth={1}
        strokeDasharray="5 5"
        activeDot={false}
      />
      <Area
        type="monotone"
        dataKey="Rango Mínimo"
        stroke="#90C418"
        strokeWidth={1}
        strokeDasharray="5 5"
        fill="#90C41833"
        fillOpacity={0.3}
        activeDot={false}
        baseValue="dataMin"
      />
      <Line
        type="monotone"
        dataKey="Ejecutado"
        stroke="#156082"
        strokeWidth={2}
        dot={false}
      />
      <Line
        type="monotone"
        dataKey="Reprogramación Diaria"
        stroke="#C00000"
        strokeWidth={2}
        dot={false}
      />
      <Line
        type="monotone"
        dataKey="Pronóstico"
        stroke="#F39200"
        strokeWidth={2}
        dot={false}
      />
    </ComposedChart>
  );
};
