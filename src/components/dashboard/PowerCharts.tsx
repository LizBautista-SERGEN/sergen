
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell, Rectangle } from 'recharts';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";
import { EnergyData } from "@/types/energy";

interface PowerChartsProps {
  energyData: EnergyData[];
  date: Date | undefined;
}

export const PowerCharts = ({ energyData, date }: PowerChartsProps) => {
  const getChartData = () => {
    if (!date) return [];

    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return days.map(currentDate => {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const dayData = energyData.find(data => data.date === dateStr);
      
      return {
        name: format(currentDate, 'dd/MM'),
        "Potencia Pronosticada": dayData?.demand || 0,
        "Potencia Ejecutada": dayData?.consumption || 0
      };
    });
  };

  const getBarChartData = () => {
    if (!date) return [];

    // Filter data for the current month only
    const currentMonthData = energyData.filter(data => {
      const dataDate = new Date(data.date);
      return isSameMonth(dataDate, date);
    });

    const data = currentMonthData.map(data => ({
      date: format(new Date(data.date), 'dd/MM'),
      fullDate: new Date(data.date),
      value: data.demand || 0,
      selected: date && isSameDay(new Date(data.date), date)
    }));

    // Sort the data by value to find max and second max
    const sortedData = [...data].sort((a, b) => b.value - a.value);
    const maxValue = sortedData[0]?.value;
    const secondMaxValue = sortedData[1]?.value;

    // Add color information to the data
    return data.map(item => ({
      ...item,
      color: item.value === maxValue ? '#C00000' : 
             item.value === secondMaxValue ? '#F39200' : 
             '#156082'
    }));
  };

  const CustomBackground = ({ x, y, width, selected }: any) => {
    console.log('CustomBackground props:', { x, y, width, selected }); // Debug log
    if (!selected) return null;
    
    return (
      <Rectangle
        x={x}
        y={0}
        width={width}
        height={300}
        fill="rgba(0, 0, 0, 0.1)"
      />
    );
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
            <Line 
              type="monotone" 
              dataKey="Potencia Pronosticada" 
              stroke="#8884d8" 
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="Potencia Ejecutada" 
              stroke="#82ca9d" 
              strokeWidth={2}
            />
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
            <Tooltip 
              formatter={(value) => [`${value} kW`, 'Potencia']}
              labelFormatter={(label) => `Fecha: ${label}`}
            />
            <Bar dataKey="value">
              {getBarChartData().map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                />
              ))}
            </Bar>
            {getBarChartData().map((entry, index) => (
              <CustomBackground
                key={`background-${index}`}
                x={index * (650 / getBarChartData().length)}
                width={650 / getBarChartData().length}
                selected={entry.selected}
              />
            ))}
          </BarChart>
        </CardContent>
      </Card>
    </>
  );
};
