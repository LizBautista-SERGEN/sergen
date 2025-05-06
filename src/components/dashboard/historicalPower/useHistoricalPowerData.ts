import { useState, useEffect } from "react";
import { format, subDays, parseISO } from "date-fns";
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
        
        console.log("Fetching historical power data...");
        console.log("Date range:", {
          start: oneHundredTwentyDaysAgo.toISOString(),
          end: today.toISOString()
        });
        
        // First get the current session to include auth token
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          throw new Error("No active session found. Please log in.");
        }
        
        // Call our edge function to get the historical power data with auth header
        const response = await supabase.functions.invoke(
          "get-historical-power-data", 
          {
            body: {
              start_date: oneHundredTwentyDaysAgo.toISOString(),
              end_date: today.toISOString(),
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
          setIsLoading(false);
          return;
        }

        console.log(`Retrieved ${data.length} records from edge function`);
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
        // Process to find daily maximums between 18:00 and 23:00
        const dailyMaximums: Record<string, { fecha: string, max_power: number }> = {};
        
        data.forEach(item => {
          if (!item.fecha || typeof item.ejecutado !== 'number') {
            return;
          }

          try {
            // Parse the date string to a Date object
            const date = typeof item.fecha === 'string' ? parseISO(item.fecha) : new Date(item.fecha);
            
            // Get hour in UTC since the dates in Supabase are stored in UTC
            const hour = date.getUTCHours();
            
            // Filter for hours between 18:00 and 23:00
            if (hour >= 18 && hour <= 23) {
              const dateString = format(date, 'yyyy-MM-dd');
              
              if (!dailyMaximums[dateString] || item.ejecutado > dailyMaximums[dateString].max_power) {
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
        
        console.log('Daily maximums processed:', Object.keys(dailyMaximums).length);
        
        // Convert to chart data format
        const formattedData = Object.values(dailyMaximums)
          .map(item => {
            const date = typeof item.fecha === 'string' ? parseISO(item.fecha) : new Date(item.fecha);
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
          
          // Assign colors
          formattedData.forEach(item => {
            if (sortedByValue.length > 0 && item.value === sortedByValue[0].value) {
              item.color = '#D9001B'; // Red for highest
            } else if (sortedByValue.length > 1 && item.value === sortedByValue[1].value) {
              item.color = '#F97316'; // Amber for second highest
            } else {
              item.color = '#156082'; // Default blue for the rest
            }
          });
        }
        
        setChartData(formattedData);
        console.log('Power maximum data count:', formattedData.length);
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
