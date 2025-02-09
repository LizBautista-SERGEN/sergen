import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, Cell, Rectangle } from 'recharts';
import { format, isSameMonth, isSameDay } from "date-fns";
import { EnergyData } from "@/types/energy";

interface PowerChartsProps {
  energyData: EnergyData[];
  date: Date | undefined;
}

export const PowerCharts = ({ energyData, date }: PowerChartsProps) => {
  const getChartData = () => {
    if (!date) return [];

    const selectedDateStr = format(date, 'yyyy-MM-dd');
    const dayData = energyData.find(data => data.date === selectedDateStr);
    
    if (!dayData) return [];

    const intervals = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        intervals.push({
          name: time,
          "Potencia Pronosticada": dayData.demand * (0.85 + Math.random() * 0.3),
          "Potencia Ejecutada": dayData.consumption * (0.85 + Math.random() * 0.3)
        });
      }
    }
    
    return intervals;
  };

  const getBarChartData = () => {
    if (!date) return [];

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

    const sortedData = [...data].sort((a, b) => b.value - a.value);
    const maxValue = sortedData[0]?.value;
    const secondMaxValue = sortedData[1]?.value;

    return data.map(item => ({
      ...item,
      color: item.value === maxValue ? '#C00000' : 
             item.value === secondMaxValue ? '#f39200' : 
             '#156082'
    }));
  };

  const CustomBackground = ({ x, width, selected }: any) => {
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

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex-1">
        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle>Pronóstico diario de potencia máxima</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <LineChart width={650} height={250} data={getChartData()}>
              <XAxis dataKey="name" />
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
          </CardContent>
        </Card>
      </div>

      <div className="flex-1">
        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle>Historial diario de potencia máxima</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <BarChart width={650} height={250} data={getBarChartData()}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value} kW`, 'Potencia']}
                labelFormatter={(label) => `Fecha: ${label}`}
              />
              {getBarChartData().map((entry, index) => (
                <CustomBackground
                  key={`background-${index}`}
                  x={index * (650 / getBarChartData().length)}
                  width={650 / getBarChartData().length}
                  selected={entry.selected}
                />
              ))}
              <Bar dataKey="value">
                {getBarChartData().map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                  />
                ))}
              </Bar>
            </BarChart>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
