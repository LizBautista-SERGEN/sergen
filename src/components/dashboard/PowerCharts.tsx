
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { format, subDays, addDays } from "date-fns";
import { EnergyData } from "@/types/energy";

interface PowerChartsProps {
  energyData: EnergyData[];
  date: Date | undefined;
}

export const PowerCharts = ({ energyData, date }: PowerChartsProps) => {
  const getChartData = () => {
    if (!date) return [];

    const startDate = subDays(date, 3);
    const endDate = addDays(date, 3);
    const chartData = [];
    let currentDate = startDate;

    while (currentDate <= endDate) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const dayData = energyData.find(data => data.date === dateStr);
      
      chartData.push({
        name: format(currentDate, 'dd/MM'),
        value: dayData?.demand || 0,
        consumption: dayData?.consumption || 0
      });

      currentDate = addDays(currentDate, 1);
    }

    return chartData;
  };

  const getBarChartData = () => {
    if (!date) return [];

    const startDate = subDays(date, 6);
    const endDate = date;
    const chartData = [];
    let currentDate = startDate;

    while (currentDate <= endDate) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const dayData = energyData.find(data => data.date === dateStr);
      
      chartData.push({
        date: format(currentDate, 'dd/MM'),
        value: dayData?.demand || 0
      });

      currentDate = addDays(currentDate, 1);
    }

    return chartData;
  };

  return (
    <>
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle>Pronóstico diario de potencia máxima</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <LineChart width={650} height={300} data={getChartData()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
          </LineChart>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Historial diario de potencia máxima</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <BarChart width={650} height={300} data={getBarChartData()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#1e3a8a" />
          </BarChart>
        </CardContent>
      </Card>
    </>
  );
};
