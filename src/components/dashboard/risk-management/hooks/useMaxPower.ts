
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
        const startDate = new Date(date);
        startDate.setHours(18, 0, 0, 0);
        
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        
        console.log('Fetching max power for range:', startDate.toISOString(), 'to', endDate.toISOString());
        
        const { data, error } = await supabase
          .from('coes_forecast')
          .select('fecha, reprogramado')
          .gte('fecha', startDate.toISOString())
          .lte('fecha', endDate.toISOString());
          
        if (error) {
          console.error('Error fetching max power:', error);
          calculateMaxPower(); // Fallback
          return;
        }
        
        if (data && data.length > 0) {
          // Log data for debugging
          data.forEach(item => {
            const time = new Date(item.fecha).toLocaleTimeString();
            console.log(`Time: ${time}, Value: ${item.reprogramado}`);
          });
          
          // Filter out any null values first
          const validData = data.filter(item => item.reprogramado !== null);
          
          if (validData.length > 0) {
            // Find the maximum reprogramado value in the dataset
            const maxRecord = validData.reduce((prev, current) => {
              return (prev.reprogramado! > current.reprogramado!) ? prev : current;
            });
            
            console.log(`Selected max value: ${maxRecord.reprogramado} at ${new Date(maxRecord.fecha).toLocaleTimeString()}`);
            setMaxPower(Number(maxRecord.reprogramado!.toFixed(2)));
            return;
          } else {
            console.log('No valid reprogramado values found in range');
          }
        } else {
          console.log('No data found for the selected date');
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
