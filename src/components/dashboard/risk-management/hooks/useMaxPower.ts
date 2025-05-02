
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { EnergyData } from "@/types/energy";

export const useMaxPower = (date: Date | undefined, energyData: EnergyData[]) => {
  const [maxPower, setMaxPower] = useState<number>(0);

  // Fetch max power from coes_forecast for selected date
  useEffect(() => {
    const fetchMaxPower = async () => {
      if (!date) return;
      
      try {
        const startOfDay = new Date(date);
        startOfDay.setHours(18, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        // Instead of getting just the first record, let's get all records in the range
        // and find the maximum value manually
        const { data, error } = await supabase
          .from('coes_forecast')
          .select('reprogramado')
          .gte('fecha', startOfDay.toISOString())
          .lte('fecha', endOfDay.toISOString());
          
        if (error) {
          console.error('Error fetching max power:', error);
          return;
        }
        
        if (data && data.length > 0) {
          // Find the maximum reprogramado value in the dataset
          let maxValue = 0;
          data.forEach(record => {
            if (record.reprogramado && record.reprogramado > maxValue) {
              maxValue = record.reprogramado;
            }
          });
          
          if (maxValue > 0) {
            setMaxPower(Number(maxValue.toFixed(2)));
            return;
          }
        }
        
        // Fallback to simulated data if real data not available
        calculateMaxPower();
      } catch (error) {
        console.error('Error in fetchMaxPower:', error);
        calculateMaxPower(); // Fallback
      }
    };
    
    fetchMaxPower();
  }, [date, energyData]);

  // Fallback function if real data not available
  const calculateMaxPower = () => {
    if (!date || !energyData.length) return;

    const selectedDateStr = format(date, 'yyyy-MM-dd');
    const dayData = energyData.find(data => data.date === selectedDateStr);
    
    if (!dayData) return;

    const intervals = [];
    for (let hour = 18; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        intervals.push(dayData.forecasted_power * (0.85 + Math.random() * 0.3));
      }
    }
    
    const maxValue = Math.max(...intervals);
    setMaxPower(Number(maxValue.toFixed(2)));
  };

  return maxPower;
};
