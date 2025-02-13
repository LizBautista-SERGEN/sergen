
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, Cell, Rectangle } from 'recharts';
import { format, isSameMonth, isSameDay } from "date-fns";
import { EnergyData, CoesData } from "@/types/energy";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PowerChartsProps {
  energyData: EnergyData[];
  date: Date | undefined;
}

// Simplified LineChart data type
type LineChartData = {
  name: string;
  pronosticoCOES: number | null;
  ejecutadoCOES: number | null;
  pronosticoSemanal: number | null;
};

// Simplified BarChart data type
type BarChartData = {
  date: string;
  value: number;
  selected: boolean;
  color: string;
};

// Background props type
type BackgroundProps = {
  x: number;
  width: number;
  selected: boolean;
};

// Predefined time slots
const TIME_SLOTS = [
  "00:00", "00:30", "01:00", "01:30", "02:00", "02:30", "03:00", "03:30",
  "04:00", "04:30", "05:00", "05:30", "06:00", "06:30", "07:00", "07:30",
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
  "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"
] as const;

const fetchCoesData = async (): Promise<CoesData[]> => {
  const today = new Date();
  const formattedDate = format(today, 'yyyy-MM-dd');
  
  const { data, error } = await supabase
    .from('coes_demand_data')
    .select('*')
    .eq('date::date', formattedDate)
    .order('date', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const PowerCharts = ({ energyData, date }: PowerChartsProps) => {
  const currentTime = new Date();
  const currentTimeStr = format(currentTime, 'HH:mm');

  const { data: coesData = [] } = useQuery({
    queryKey: ['coes-data'],
    queryFn: fetchCoesData
  });

  const prepareBarChartData = (data: EnergyData[]): BarChartData[] => {
    if (!date) return [];

    const monthData = data.filter(item => 
      isSameMonth(new Date(item.date), date)
    ).map(item => ({
      date: format(new Date(item.date), 'dd/MM'),
      value: item.forecasted_power || 0,
      selected: date && isSameDay(new Date(item.date), date),
      color: '#156082' // Default color
    }));

    const sortedValues = [...monthData].sort((a, b) => b.value - a.value);
    const maxValue = sortedValues[0]?.value;
    const secondMaxValue = sortedValues[1]?.value;

    return monthData.map(item => ({
      ...item,
      color: item.value === maxValue ? '#C00000' : 
             item.value === secondMaxValue ? '#f39200' : 
             '#156082'
    }));
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

  const prepareLineChartData = (): LineChartData[] => {
    return TIME_SLOTS.map(slot => {
      const slotData = coesData.find(data => 
        format(new Date(data.date), 'HH:mm') === slot
      );
      
      return {
        name: slot,
        pronosticoCOES: slot >= currentTimeStr ? slotData?.daily_forecast ?? null : null,
        ejecutadoCOES: slot <= currentTimeStr ? slotData?.executed_power ?? null : null,
        pronosticoSemanal: slot >= currentTimeStr ? slotData?.weekly_forecast ?? null : null
      };
    });
  };

  const barChartData = prepareBarChartData(energyData);
  const lineChartData = prepareLineChartData();

  return (
    <>
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-center">
            <span>Pronóstico diario de potencia máxima</span>
            <span className="text-sm font-normal text-muted-foreground">
              Hora actual: {currentTimeStr}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <LineChart 
            width={650} 
            height={300} 
            data={lineChartData}
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
              dataKey="pronosticoCOES" 
              name="Pronóstico COES"
              stroke="#f39200" 
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />
            <Line 
              type="monotone" 
              dataKey="ejecutadoCOES"
              name="Ejecutado COES" 
              stroke="#156082" 
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />
            <Line 
              type="monotone" 
              dataKey="pronosticoSemanal"
              name="Pronóstico Semanal" 
              stroke="#C00000" 
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />
          </LineChart>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Histórico diario de potencia máxima</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <BarChart width={650} height={300} data={barChartData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value) => [`${value} kW`, 'Potencia']}
              labelFormatter={(label) => `Fecha: ${label}`}
            />
            {barChartData.map((entry, index) => (
              <CustomBackground
                key={`background-${index}`}
                x={index * (650 / barChartData.length)}
                width={650 / barChartData.length}
                selected={entry.selected}
              />
            ))}
            <Bar dataKey="value">
              {barChartData.map((entry, index) => (
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
