
import { format } from "date-fns";
import { PowerData } from "../types";
import { ChartData } from "../types";

export const processMaximumData = (data: PowerData[]): ChartData[] => {
  try {
    console.log("Processing data, total records:", data.length);
    
    // Process to find daily maximums between 18:00 and 23:00
    const dailyMaximums: Record<string, { fecha: string, max_power: number }> = {};
    
    // Count records in the 18:00-23:00 range for debugging
    let count18to23 = 0;
    
    // Extract records from the 18:00-23:00 UTC range
    data.forEach(item => {
      if (!item.fecha || typeof item.ejecutado !== 'number') {
        console.log("Skipping invalid item:", item);
        return;
      }

      try {
        // Parse the date string to a Date object
        const date = new Date(item.fecha);
        
        // Get hour in UTC
        const hour = date.getUTCHours();
        
        // Filter for hours between 18:00 and 23:00
        if (hour >= 18 && hour <= 23) {
          count18to23++;
          const dateString = format(date, 'yyyy-MM-dd');
          
          // Debug logging for each data point
          console.log(`Processing data point: Date=${dateString}, Hour=${hour}, Value=${item.ejecutado}`);
          
          if (!dailyMaximums[dateString] || item.ejecutado > dailyMaximums[dateString].max_power) {
            console.log(`New maximum for ${dateString}: ${item.ejecutado}, replacing ${dailyMaximums[dateString]?.max_power || 'none'}`);
            dailyMaximums[dateString] = {
              fecha: item.fecha,
              max_power: item.ejecutado
            };
          }
        }
      } catch (error) {
        console.error('Error processing date:', error, item);
      }
    });
    
    console.log(`Found ${count18to23} records in the 18:00-23:00 range`);
    console.log('Daily maximums processed:', Object.keys(dailyMaximums).length);
    
    if (Object.keys(dailyMaximums).length === 0) {
      console.log("No maximum values found in the 18:00-23:00 time range");
      return [];
    }
    
    // Get the maximum values found and log them
    const maxValues = Object.values(dailyMaximums).sort((a, b) => b.max_power - a.max_power);
    const highestValue = maxValues[0];
    const secondHighestValue = maxValues.length > 1 ? maxValues[1] : null;
    
    console.log(`Highest value: ${highestValue.max_power} at ${new Date(highestValue.fecha).toISOString()}`);
    if (secondHighestValue) {
      console.log(`Second highest value: ${secondHighestValue.max_power} at ${new Date(secondHighestValue.fecha).toISOString()}`);
    }
    
    // Convert to chart data format
    const formattedData = Object.entries(dailyMaximums)
      .map(([dateKey, item]) => {
        const date = new Date(item.fecha);
        return {
          date: format(date, 'dd/MM'),
          fullDate: item.fecha,
          value: item.max_power,
          color: '#156082' // Default color, will be updated below
        };
      })
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
    
    console.log('Formatted data count:', formattedData.length);
    
    // Find maximum value and assign color
    if (formattedData.length > 0) {
      // Sort by value to find highest values
      const sortedByValue = [...formattedData].sort((a, b) => b.value - a.value);
      
      console.log('Top values after sorting:', sortedByValue.slice(0, 3).map(v => v.value));
      
      // Assign colors - make sure we have at least one data point
      formattedData.forEach(item => {
        if (sortedByValue.length > 0 && item.value === sortedByValue[0].value) {
          item.color = '#D9001B'; // Red for highest
          console.log(`Setting highest value color (red): ${item.date}, ${item.value}`);
        } else if (sortedByValue.length > 1 && item.value === sortedByValue[1].value) {
          item.color = '#F97316'; // Amber for second highest
          console.log(`Setting second highest value color (amber): ${item.date}, ${item.value}`);
        } else {
          item.color = '#156082'; // Default blue for the rest
        }
      });
    }
    
    console.log('Power maximum data ready for chart, count:', formattedData.length);
    
    // Display full formatted data for debugging
    console.log("Final chart data:", formattedData);
    
    return formattedData;
  } catch (err: any) {
    console.error('Error in processMaximumData:', err);
    throw new Error(`Error processing data: ${err.message}`);
  }
};
