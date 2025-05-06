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
        // Create date objects for the range we want to query
        // Keep the date in UTC without timezone conversion
        const formattedDate = format(date, 'yyyy-MM-dd');
        console.log('Formatted date for query:', formattedDate);
        
        // Query the data using .eq() to match the date part only
        const { data, error } = await supabase
          .from('coes_forecast')
          .select('fecha, reprogramado')
          .filter('fecha', 'gte', `${formattedDate}T18:00:00`)
          .filter('fecha', 'lt', `${formattedDate}T24:00:00`);
          
        if (error) {
          console.error('Error fetching max power:', error);
          calculateMaxPower(); // Fallback
          return;
        }
        
        if (data && data.length > 0) {
          console.log(`Found ${data.length} records in the 18:00-24:00 range`);
          
          // Log all values to help with debugging
          data.forEach(item => {
            const itemDate = new Date(item.fecha);
            const time = itemDate.toISOString().substring(11, 19); // Extract time part in HH:MM:SS format
            console.log(`Time (UTC): ${time}, Value: ${item.reprogramado}`);
          });
          
          // Find the maximum reprogramado value in the dataset
          let maxValue = 0;
          let maxTime = '';
          
          data.forEach(record => {
            if (record.reprogramado && record.reprogramado > maxValue) {
              maxValue = record.reprogramado;
              const recordDate = new Date(record.fecha);
              maxTime = recordDate.toISOString().substring(11, 19); // Extract time part in HH:MM:SS format
            }
          });
          
          if (maxValue > 0) {
            console.log(`Selected max value: ${maxValue} at ${maxTime} UTC`);
            setMaxPower(Number(maxValue.toFixed(2)));
            return;
          } else {
            console.log('No valid reprogramado values found in range');
          }
        } else {
          console.log('No data found for the selected date in the 18:00-24:00 range');
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
