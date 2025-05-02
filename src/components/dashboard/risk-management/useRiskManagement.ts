
import { useState } from "react";
import { EnergyData } from "@/types/energy";
import { useForecastSettings } from "./hooks/useForecastSettings";
import { useModulationData } from "./hooks/useModulationData";
import { useMaxPower } from "./hooks/useMaxPower";

export const useRiskManagement = (energyData: EnergyData[], date: Date | undefined, setDate: (date: Date | undefined) => void) => {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  
  // Use our new custom hooks
  const settings = useForecastSettings();
  // Pasar array vacío si energyData es undefined
  const maxPower = useMaxPower(date, energyData || []);
  const { 
    modulationData, 
    modulatedDays, 
    isLoading, 
    isDateModulated 
  } = useModulationData(selectedMonth);

  return {
    maxPower,
    settings,
    modulatedDays,
    modulationData,
    isLoading,
    selectedMonth,
    setSelectedMonth,
    setDate,
    isDateModulated
  };
};
