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
        console.log('========================== MAX POWER CALCULATION START ==========================');
        console.log('Current date selected:', date.toISOString());
        
        // Format the date to use with SQL query
        const formattedDate = format(date, 'yyyy-MM-dd');
        
        console.log('Using formatted date for query:', formattedDate);
        
        // Query to get the maximum reprogramado value in the 18:00-23:00 range for the selected date
        const { data, error } = await supabase
          .from('coes_forecast')
          .select('fecha, reprogramado')
          .like('fecha', `${formattedDate}%`) // Use the date part only
          .not('reprogramado', 'is', null) // Filter out null values
          .order('reprogramado', { ascending: false }); // Order by reprogramado DESC to get highest first
          
        if (error) {
          console.error('Error fetching max power:', error);
          console.log('Falling back to calculated max power due to query error');
          calculateMaxPower();
          return;
        }

        // Log the raw data returned from the query
        console.log('Raw data from query (before time filtering):', data);
        
        if (!data || data.length === 0) {
          console.log('No data found for the specified date, using fallback calculation');
          calculateMaxPower();
          return;
        }
        
        // Filter to only include times between 18:00 and 23:00 (without timezone conversion)
        const filteredByTime = data.filter(item => {
          const itemDate = new Date(item.fecha);
          const hours = itemDate.getHours();
          
          console.log(`Checking record: ${item.fecha}, Hour: ${hours}, Value: ${item.reprogramado}`);
          
          // Keep records where the hour is between 18 and 23 inclusive
          return hours >= 18 && hours <= 23;
        });
        
        console.log(`After time filtering: found ${filteredByTime.length} records in 18:00-23:00 range out of ${data.length} total`);
        
        if (filteredByTime.length === 0) {
          console.log('No data found in the 18:00-23:00 time range, using fallback calculation');
          calculateMaxPower();
          return;
        }
        
        // Print all values found in the range for verification
        console.log('All valid values in 18:00-23:00 range:');
        filteredByTime.forEach(item => {
          const itemDate = new Date(item.fecha);
          console.log(`Time: ${itemDate.getHours()}:${itemDate.getMinutes().toString().padStart(2, '0')}, Value: ${item.reprogramado}`);
        });
        
        // Find the highest value in the filtered data
        const maxRecord = filteredByTime.reduce((max, current) => {
          return (current.reprogramado > max.reprogramado) ? current : max;
        }, filteredByTime[0]);
        
        console.log(`SELECTED MAXIMUM VALUE: ${maxRecord.reprogramado} at ${new Date(maxRecord.fecha).toLocaleTimeString()}`);
        
        // Set the max power state with the highest value found
        setMaxPower(Number(maxRecord.reprogramado));
        
        console.log('========================== MAX POWER CALCULATION END ==========================');
      } catch (error) {
        console.error('Error in fetchMaxPower:', error);
        calculateMaxPower();
      }
    };
    
    fetchMaxPower();
  }, [date, energyData]);

  // Fallback function if real data not available
  const calculateMaxPower = () => {
    if (!date || !energyData.length) return;

    console.log('Using fallback calculation method for max power');
    const selectedDateStr = format(date, 'yyyy-MM-dd');
    const dayData = energyData.find(data => data.date === selectedDateStr);
    
    if (!dayData) {
      console.log('No fallback data available for the selected date');
      return;
    }

    const intervals = [];
    for (let hour = 18; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        intervals.push(dayData.forecasted_power * (0.85 + Math.random() * 0.3));
      }
    }
    
    const maxValue = Math.max(...intervals);
    console.log(`Fallback max power calculated: ${maxValue.toFixed(2)}`);
    setMaxPower(Number(maxValue.toFixed(2)));
  };

  return maxPower;
};
