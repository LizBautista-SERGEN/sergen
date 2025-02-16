
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { EnergyData } from "@/types/energy";

interface EnergyForecastChartProps {
  energyData: EnergyData[];
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export const EnergyForecastChart = ({ energyData, selectedDate, onDateChange }: EnergyForecastChartProps) => {
  // Ordenar las fechas de más reciente a más antigua
  const uniqueDates = [...new Set(energyData.map(data => data.date))]
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  // Filtrar y preparar los datos para el gráfico
  const chartData = energyData
    .filter(data => data.date === selectedDate)
    .map(data => ({
      time: data.time,
      "Potencia Pronosticada": data.executed_power ? null : data.forecasted_power,
      "Potencia Ejecutada": data.executed_power || null
    }))
    .sort((a, b) => a.time.localeCompare(b.time));

  console.log('Datos del gráfico:', chartData);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vista Previa del Pronóstico</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select value={selectedDate} onValueChange={onDateChange}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar fecha" />
            </SelectTrigger>
            <SelectContent>
              {uniqueDates.map((date) => (
                <SelectItem key={date} value={date}>
                  {format(new Date(date), 'dd/MM/yyyy', { locale: es })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis 
                  dataKey="time"
                  interval={5}
                  angle={-45}
                  textAnchor="end"
                  height={50}
                />
                <YAxis 
                  label={{ 
                    value: 'Potencia (MW)', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' }
                  }}
                />
                <Tooltip 
                  formatter={(value: any) => value ? [`${value.toFixed(2)} MW`, ''] : ['No disponible', '']}
                  labelFormatter={(label) => `Hora: ${label}`}
                />
                <Legend verticalAlign="top" height={36}/>
                <Line
                  type="monotone"
                  dataKey="Potencia Pronosticada"
                  stroke="#f39200"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={true}
                />
                <Line
                  type="monotone"
                  dataKey="Potencia Ejecutada"
                  stroke="#156082"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
