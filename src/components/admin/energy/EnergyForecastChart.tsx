
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { EnergyData } from "@/types/energy-data";

interface EnergyForecastChartProps {
  energyData: EnergyData[];
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export const EnergyForecastChart = ({ energyData, selectedDate, onDateChange }: EnergyForecastChartProps) => {
  const uniqueDates = [...new Set(energyData.map(data => data.date))];

  const getChartData = (date: string) => {
    return energyData
      .filter(data => data.date === date)
      .map(data => ({
        time: data.time,
        "Potencia Pronosticada": data.forecasted_power,
        "Potencia Ejecutada": data.executed_power
      }));
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
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="Potencia Pronosticada"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="Potencia Ejecutada"
                  stroke="#82ca9d"
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
