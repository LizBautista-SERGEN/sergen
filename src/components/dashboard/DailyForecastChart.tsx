
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { SimpleLineChartData, CHART_COLORS } from "./types";

type DailyForecastChartProps = {
  data: SimpleLineChartData[];
  currentTime: string;
};

export const DailyForecastChart = ({ data, currentTime }: DailyForecastChartProps) => (
  <Card className="mb-6">
    <CardHeader className="pb-2">
      <CardTitle className="flex justify-between items-center">
        <span>Pronóstico diario de potencia máxima</span>
        <span className="text-sm font-normal text-muted-foreground">
          Hora actual: {currentTime}
        </span>
      </CardTitle>
    </CardHeader>
    <CardContent className="p-4">
      <LineChart 
        width={650} 
        height={300} 
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <XAxis 
          dataKey="name"
          interval="preserveStartEnd"
          minTickGap={30}
          ticks={[
            "00:00", "02:00", "04:00", "06:00", "08:00", "10:00", 
            "12:00", "14:00", "16:00", "18:00", "20:00", "22:00", "23:59"
          ]}
        />
        <YAxis 
          domain={[6000, 9000]}
          tickFormatter={(value) => `${value.toLocaleString()}`}
        />
        <Tooltip 
          formatter={(value: any) => value !== null ? [`${value.toLocaleString()} MW`, ''] : ['Sin datos', '']}
          labelFormatter={(label) => `Hora: ${label}`}
        />
        <Line 
          type="monotone" 
          dataKey="ejecutadoCOES" 
          name="Ejecutado COES"
          stroke={CHART_COLORS.primary}
          strokeWidth={2}
          dot={false}
          connectNulls={false}
        />
        <Line 
          type="monotone" 
          dataKey="pronosticoCOES"
          name="Pronóstico Diario" 
          stroke={CHART_COLORS.secondary}
          strokeWidth={2}
          dot={false}
          connectNulls={false}
        />
        <Line 
          type="monotone" 
          dataKey="pronosticoSemanal"
          name="Pronóstico Semanal" 
          stroke={CHART_COLORS.highlight}
          strokeWidth={2}
          dot={false}
          connectNulls={false}
        />
      </LineChart>
    </CardContent>
  </Card>
);
