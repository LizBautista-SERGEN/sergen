
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, Cell, Rectangle } from 'recharts';
import { format, isSameMonth, isSameDay, setHours, setMinutes, addMinutes } from "date-fns";
import { EnergyData, CoesData } from "@/types/energy";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PowerChartsProps {
  energyData: EnergyData[];
  date: Date | undefined;
}

interface DailyChartData {
  name: string;
  timestamp: Date;
  "Pronóstico COES": number | null;
  "Ejecutado COES": number | null;
  "Pronóstico Semanal": number | null;
}

interface CustomBackgroundProps {
  x: number;
  width: number;
  selected: boolean;
}

const createTimeSlots = (baseDate: Date): Date[] => {
  const slots: Date[] = [];
  const startOfDay = setMinutes(setHours(baseDate, 0), 0);
  
  for (let i = 0; i < 48; i++) {
    slots.push(addMinutes(startOfDay, i * 30));
  }
  
  return slots;
};

const fetchCoesData = async () => {
  const today = new Date();
  const formattedDate = format(today, 'yyyy-MM-dd');
  
  const { data, error } = await supabase
    .from('coes_demand_data')
    .select('*')
    .eq('date::date', formattedDate)
    .order('date', { ascending: true });

  if (error) throw error;
  return data as CoesData[];
};

export const PowerCharts = ({ energyData, date }: PowerChartsProps) => {
  const { data: coesData = [] } = useQuery({
    queryKey: ['coes-data'],
    queryFn: fetchCoesData
  });

  const getChartData = (): DailyChartData[] => {
    const today = new Date();
    const timeSlots = createTimeSlots(today);
    
    // Crear un mapa de los datos existentes indexados por hora:minuto
    const dataMap = new Map(
      coesData.map(data => {
        const date = new Date(data.date);
        const key = format(date, 'HH:mm');
        return [key, data];
      })
    );

    // Generar datos para cada intervalo de 30 minutos
    return timeSlots.map(slot => {
      const timeKey = format(slot, 'HH:mm');
      const existingData = dataMap.get(timeKey);

      return {
        name: timeKey,
        timestamp: slot,
        "Pronóstico COES": existingData?.daily_forecast || null,
        "Ejecutado COES": existingData?.executed_power || null,
        "Pronóstico Semanal": existingData?.weekly_forecast || null
      };
    });
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

  const CustomBackground = ({ x, width, selected }: CustomBackgroundProps) => {
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
          <LineChart 
            width={650} 
            height={300} 
            data={getChartData()}
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
              dataKey="Pronóstico COES" 
              stroke="#f39200" 
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />
            <Line 
              type="monotone" 
              dataKey="Ejecutado COES" 
              stroke="#156082" 
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />
            <Line 
              type="monotone" 
              dataKey="Pronóstico Semanal" 
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
