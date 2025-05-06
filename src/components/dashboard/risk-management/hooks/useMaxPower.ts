
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
        // Set up date range for 18:00-23:00
        const startDate = new Date(date);
        startDate.setHours(18, 0, 0, 0);
        
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        
        console.log('Fetching max power for range:', startDate.toISOString(), 'to', endDate.toISOString());
        
        // Query the database for records in the time range
        const { data, error } = await supabase
          .from('coes_forecast')
          .select('fecha, reprogramado')
          .gte('fecha', startDate.toISOString())
          .lte('fecha', endDate.toISOString());
          
        if (error) {
          console.error('Error fetching max power:', error);
          calculateMaxPower(); // Fallback if there's an error
          return;
        }
        
        if (data && data.length > 0) {
          console.log(`Found ${data.length} records in range. Full data:`, data);
          
          // Filter out null values and print all records for debugging
          const validRecords = data.filter(record => record.reprogramado !== null);
          
          if (validRecords.length === 0) {
            console.log('No valid data found in range (all reprogramado values are null)');
            calculateMaxPower(); // Fallback
            return;
          }
          
          console.log(`Found ${validRecords.length} valid records after filtering nulls`);
          
          // Find maximum value manually to ensure we get the absolute maximum
          let maxRecord = validRecords[0];
          for (let i = 1; i < validRecords.length; i++) {
            if (validRecords[i].reprogramado! > maxRecord.reprogramado!) {
              maxRecord = validRecords[i];
            }
          }
          
          console.log('All valid values in range:');
          validRecords.forEach(item => {
            const time = new Date(item.fecha).toLocaleTimeString();
            console.log(`Time: ${time}, Value: ${item.reprogramado}`);
          });
          
          console.log(`Selected maximum value: ${maxRecord.reprogramado} at ${new Date(maxRecord.fecha).toLocaleTimeString()}`);
          
          setMaxPower(Number(maxRecord.reprogramado!.toFixed(2)));
        } else {
          console.log('No data found for the selected date range');
          calculateMaxPower(); // Fallback
        }
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
