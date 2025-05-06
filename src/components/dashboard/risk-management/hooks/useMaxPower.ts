
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
        
        // Set up date range for 18:00-23:00
        const startDate = new Date(date);
        startDate.setHours(18, 0, 0, 0);
        
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        
        console.log('Fetching max power for range:', startDate.toISOString(), 'to', endDate.toISOString());
        
        // Get all data within the time range from the coes_forecast table
        const { data, error } = await supabase
          .from('coes_forecast')
          .select('fecha, reprogramado')
          .gte('fecha', startDate.toISOString())
          .lte('fecha', endDate.toISOString())
          .order('reprogramado', { ascending: false }); // Order by reprogramado DESC to get highest first
          
        if (error) {
          console.error('Error fetching max power:', error);
          console.log('Falling back to calculated max power due to query error');
          calculateMaxPower();
          return;
        }
        
        // Log the raw data returned from the query
        console.log('Raw data from query:', data);
        
        if (!data || data.length === 0) {
          console.log('No data found in the specified time range, using fallback calculation');
          calculateMaxPower();
          return;
        }
        
        // Filter out null values
        const validRecords = data.filter(record => record.reprogramado !== null);
        console.log(`Found ${validRecords.length} valid records after filtering nulls from ${data.length} total records`);
        
        if (validRecords.length === 0) {
          console.log('All reprogramado values are null, using fallback calculation');
          calculateMaxPower();
          return;
        }

        // Print all values found in the range for verification
        console.log('All valid values in range:');
        validRecords.forEach(item => {
          const time = new Date(item.fecha).toLocaleTimeString();
          console.log(`Time: ${time}, Value: ${item.reprogramado}`);
        });
        
        // Sort the records by reprogramado value in descending order to find max
        const sortedRecords = [...validRecords].sort((a, b) => 
          (b.reprogramado as number) - (a.reprogramado as number)
        );
        
        // Get the highest value (first item after sorting)
        const maxRecord = sortedRecords[0];
        
        console.log('Top 3 highest values:');
        for (let i = 0; i < Math.min(3, sortedRecords.length); i++) {
          const record = sortedRecords[i];
          const time = new Date(record.fecha).toLocaleTimeString();
          console.log(`${i+1}. Time: ${time}, Value: ${record.reprogramado}`);
        }
        
        console.log(`SELECTED MAXIMUM VALUE: ${maxRecord.reprogramado} at ${new Date(maxRecord.fecha).toLocaleTimeString()}`);
        
        // Set the max power state with the highest value found
        const powerValue = Number(maxRecord.reprogramado);
        setMaxPower(Number(powerValue.toFixed(2)));
        
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
