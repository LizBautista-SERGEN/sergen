
import { format, isSameMonth, isSameDay } from "date-fns";
import { EnergyData, CoesData } from "@/types/energy";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TIME_SLOTS, CHART_COLORS, SimpleLineChartData, SimpleBarChartData } from "./types";
import { DailyForecastChart } from "./DailyForecastChart";
import { HistoricalPowerChart } from "./HistoricalPowerChart";

type Props = {
  energyData: EnergyData[];
  date: Date | undefined;
};

export const PowerCharts = ({ energyData, date }: Props) => {
  const currentTime = new Date();
  const currentTimeStr = format(currentTime, 'HH:mm');

  const { data: coesData } = useQuery<CoesData[]>({
    queryKey: ['coes-data'],
    queryFn: async () => {
      const today = new Date();
      const formattedDate = format(today, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('coes_demand_data')
        .select('*')
        .eq('date::date', formattedDate)
        .order('date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    initialData: []
  });

  const prepareBarChartData = () => {
    if (!date) return [];

    const monthData = energyData
      .filter(item => isSameMonth(new Date(item.date), date))
      .map(item => ({
        date: format(new Date(item.date), 'dd/MM'),
        value: item.forecasted_power || 0,
        selected: date && isSameDay(new Date(item.date), date),
        color: CHART_COLORS.primary
      }));

    const sortedValues = [...monthData].sort((a, b) => b.value - a.value);
    const maxValue = sortedValues[0]?.value;
    const secondMaxValue = sortedValues[1]?.value;

    return monthData.map(item => ({
      ...item,
      color: item.value === maxValue ? CHART_COLORS.highlight : 
             item.value === secondMaxValue ? CHART_COLORS.secondary : 
             CHART_COLORS.primary
    }));
  };

  const prepareLineChartData = () => {
    return TIME_SLOTS.map(slot => {
      const slotData = coesData.find(data => 
        format(new Date(data.date), 'HH:mm') === slot
      );
      
      return {
        name: slot,
        pronosticoCOES: slotData?.daily_forecast ?? null,
        ejecutadoCOES: slotData?.executed_power ?? null,
        pronosticoSemanal: slotData?.weekly_forecast ?? null
      };
    });
  };

  const barChartData = prepareBarChartData();
  const lineChartData = prepareLineChartData();

  return (
    <>
      <DailyForecastChart data={lineChartData} currentTime={currentTimeStr} />
      <HistoricalPowerChart data={barChartData} />
    </>
  );
};
