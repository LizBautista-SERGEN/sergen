
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, Cell, Rectangle } from 'recharts';
import { format, isSameMonth, isSameDay } from "date-fns";
import { EnergyData } from "@/types/energy";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PowerChartsProps {
  energyData: EnergyData[];
  date: Date | undefined;
}

export const PowerCharts = ({ energyData, date }: PowerChartsProps) => {
  const { data: coesData } = useQuery({
    queryKey: ['coes-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coes_demand_data')
        .select('*')
        .order('date', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const getChartData = () => {
    if (!coesData) return [];

    return coesData.map(data => ({
      name: format(new Date(data.date), 'HH:mm'),
      "Potencia Pronosticada": data.daily_forecast,
      "Potencia Ejecutada": data.executed_power
    }));
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
      value: data.forecasted_power || 0,
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
    <>
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle>Pronóstico diario de potencia máxima</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <LineChart width={650} height={300} data={getChartData()}>
            <XAxis dataKey="name" />
            <YAxis 
              domain={[6000, 9000]}
              tickFormatter={(value) => `${value.toLocaleString()}`}
            />
            <Tooltip 
              formatter={(value: any) => value !== null ? [`${value.toLocaleString()} MW`, ''] : ['-', '']}
            />
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Histórico diario de potencia máxima</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <BarChart width={650} height={300} data={getBarChartData()}>
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
    </>
  );
};
