
import { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PowerData, ChartData } from "./types";

export const useHistoricalPowerData = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaxPowerData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Get current date
        const today = new Date();
        // Get date from 120 days ago to ensure we get all data from previous months
        const oneHundredTwentyDaysAgo = subDays(today, 120);
        
        const formattedToday = format(today, 'yyyy-MM-dd');
        const formatted120DaysAgo = format(oneHundredTwentyDaysAgo, 'yyyy-MM-dd');
        
        console.log("Fetching historical power data...");
        console.log("Date range:", {
          start: formatted120DaysAgo,
          end: formattedToday
        });
        
        // First get the current session to include auth token
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          throw new Error("No active session found. Please log in.");
        }
        
        console.log("Session found, auth token available:", !!session.access_token);
        
        // Call our edge function to get the historical power data with auth header
        const response = await supabase.functions.invoke(
          "get-historical-power-data", 
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
            body: {
              start_date: formatted120DaysAgo,
              end_date: formattedToday,
              limit: 100000, // Very high limit to ensure we get all records
            }
          }
        );
        
        if (response.error) {
          console.error('Edge function error:', response.error);
          throw new Error(`Error from edge function: ${response.error.message}`);
        }

        const data: PowerData[] = response.data;

        if (!data || data.length === 0) {
          console.log("No data found in the specified date range");
          setChartData([]);
          setIsLoading(false);
          return;
        }

        console.log(`Retrieved ${data.length} records from edge function`);
        console.log("Sample data:", data.slice(0, 3));
        
        // Process the data to find daily maximums between 18:00 and 23:00 UTC
        processData(data);
        
      } catch (err: any) {
        console.error('Error processing power data:', err);
        setError(`Error: ${err.message}`);
        toast.error("Error al cargar datos históricos de potencia");
      } finally {
        setIsLoading(false);
      }
    };
    
    const processData = (data: PowerData[]) => {
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
        
        console.log(`Found ${count18to23} records in the 18:00-24:00 range`);
        console.log('Daily maximums processed:', Object.keys(dailyMaximums).length);
        
        if (Object.keys(dailyMaximums).length > 0) {
          // Get the maximum value found and log it
          const maxValues = Object.values(dailyMaximums).sort((a, b) => b.max_power - a.max_power);
          const highestValue = maxValues[0];
          const secondHighestValue = maxValues.length > 1 ? maxValues[1] : null;
          
          console.log(`Highest value: ${highestValue.max_power} at ${new Date(highestValue.fecha).toISOString()}`);
          if (secondHighestValue) {
            console.log(`Second highest value: ${secondHighestValue.max_power} at ${new Date(secondHighestValue.fecha).toISOString()}`);
          }
        } else {
          console.log("No maximum values found in the 18:00-23:00 time range");
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
          
          console.log('Color assignment completed:', {
            highest: sortedByValue[0]?.value,
            secondHighest: sortedByValue[1]?.value,
            totalPoints: formattedData.length
          });
        }
        
        setChartData(formattedData);
        console.log('Power maximum data ready for chart, count:', formattedData.length);
      } catch (err: any) {
        console.error('Error in processData:', err);
        setError(`Error processing data: ${err.message}`);
      }
    };

    fetchMaxPowerData();
    
    // Refresh every 15 minutes
    const interval = setInterval(fetchMaxPowerData, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { chartData, isLoading, error };
};
