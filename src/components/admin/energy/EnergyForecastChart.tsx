
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

  const getChartData = (date: string) => {
    // Crear un array con las 24 horas del día
    const hoursArray = Array.from({ length: 48 }, (_, i) => {
      const hour = Math.floor(i / 2);
      const minute = (i % 2) * 30;
      return {
        time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        "Potencia Pronosticada": null,
        "Potencia Ejecutada": null
      };
    });

    // Llenar los datos reales
    const dayData = energyData
      .filter(data => data.date === date)
      .reduce((acc, data) => {
        const timeIndex = acc.findIndex(item => item.time === data.time);
        if (timeIndex >= 0) {
          // Si hay potencia ejecutada, solo mostrar ese valor
          if (data.executed_power) {
            acc[timeIndex] = {
              ...acc[timeIndex],
              "Potencia Ejecutada": data.executed_power,
              "Potencia Pronosticada": null
            };
          } else {
            // Si no hay potencia ejecutada, mostrar el pronóstico
            acc[timeIndex] = {
              ...acc[timeIndex],
              "Potencia Pronosticada": data.forecasted_power,
              "Potencia Ejecutada": null
            };
          }
        }
        return acc;
      }, hoursArray);

    return dayData;
  };

  const chartData = getChartData(selectedDate);

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
                  interval="preserveStartEnd"
                  minTickGap={30}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => value ? [value.toFixed(2), ''] : ['No disponible', '']}
                  labelFormatter={(label) => `Hora: ${label}`}
                />
                <Legend />
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
