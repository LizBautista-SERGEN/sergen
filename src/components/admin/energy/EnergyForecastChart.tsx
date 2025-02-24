
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
    const hoursArray = Array.from({ length: 24 }, (_, i) => {
      const hour = i.toString().padStart(2, '0');
      return {
        time: `${hour}:00`,
        "Potencia Pronosticada": 0,
        "Potencia Ejecutada": 0
      };
    });

    // Llenar los datos reales
    const dayData = energyData
      .filter(data => data.date === date)
      .reduce((acc, data) => {
        const hour = data.time.split(':')[0];
        const hourIndex = parseInt(hour);
        if (hourIndex >= 0 && hourIndex < 24) {
          acc[hourIndex] = {
            time: `${hour}:00`,
            "Potencia Pronosticada": data.forecasted_power,
            "Potencia Ejecutada": data.executed_power
          };
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
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Potencia Pronosticada"
                  stroke="#f39200"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="Potencia Ejecutada"
                  stroke="#156082"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
