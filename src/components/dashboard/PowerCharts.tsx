
import { format, isSameMonth, isSameDay } from "date-fns";
import { EnergyData } from "@/types/energy";
import { CHART_COLORS, SimpleBarChartData } from "./types";
import { HistoricalPowerChart } from "./HistoricalPowerChart";

type Props = {
  energyData: EnergyData[];
  date: Date | undefined;
};

export const PowerCharts = ({ energyData, date }: Props) => {
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

  const barChartData = prepareBarChartData();

  return <HistoricalPowerChart data={barChartData} />;
};
