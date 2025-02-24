
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, Rectangle } from 'recharts';
import { SimpleBarChartData, BackgroundProps } from "./types";

type HistoricalPowerChartProps = {
  data: SimpleBarChartData[];
};

const CustomBackground = ({ x, width, selected }: BackgroundProps) => {
  if (!selected) return null;
  return (
    <Rectangle
      x={x - 2}
      y={0}
      width={width + 4}
      height={300}
      fill="rgba(128, 128, 128, 0.1)"
    />
  );
};

export const HistoricalPowerChart = ({ data }: HistoricalPowerChartProps) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle>Histórico diario de potencia máxima</CardTitle>
    </CardHeader>
    <CardContent className="p-4">
      <BarChart width={650} height={300} data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip 
          formatter={(value) => [`${value} kW`, 'Potencia']}
          labelFormatter={(label) => `Fecha: ${label}`}
        />
        {data.map((entry, index) => (
          <CustomBackground
            key={`background-${index}`}
            x={index * (650 / data.length)}
            width={650 / data.length}
            selected={entry.selected}
          />
        ))}
        <Bar dataKey="value">
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.color}
            />
          ))}
        </Bar>
      </BarChart>
    </CardContent>
  </Card>
);
