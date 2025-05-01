
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
        // Get first day of the current month
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        console.log("Fetching historical power data...");
        console.log("Date range:", {
          start: firstDayOfMonth.toISOString(),
          end: today.toISOString()
        });
        
        // Call our edge function to get the historical power data
        const response = await fetch(
          "https://zbixjkgwperxqrdhvtoy.supabase.co/functions/v1/get-historical-power-data",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiaXhqa2d3cGVyeHFyZGh2dG95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkwNzM1MjAsImV4cCI6MjA1NDY0OTUyMH0.ENpjlH5HgHT1Pqx6-tXeYO8gaPeGKx5wk_YUpzP5oHQ",
            },
            body: JSON.stringify({
              start_date: firstDayOfMonth.toISOString(),
              end_date: today.toISOString(),
            }),
          }
        );
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Edge function error:', errorText);
          throw new Error(`Error from edge function: ${response.status} ${errorText}`);
        }

        const data: PowerData[] = await response.json();

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
        // Process to find daily maximums between the configured time range
        const dailyMaximums: Record<string, { fecha: string, max_power: number }> = {};
        
        // Get time range from forecast_settings
        const fetchTimeRange = async () => {
          const { data: settingsData } = await supabase
            .from('forecast_settings')
            .select('time_range')
            .single();
            
          return settingsData?.time_range || "18:00 - 23:00";
        };
        
        fetchTimeRange().then(timeRange => {
          const [startTime, endTime] = timeRange.split('-').map(time => {
            const [hours] = time.trim().split(':');
            return parseInt(hours, 10);
          });
          
          const startHour = isNaN(startTime) ? 18 : startTime;
          const endHour = isNaN(endTime) ? 23 : endTime;
          
          data.forEach(item => {
            if (!item.fecha || typeof item.ejecutado !== 'number') {
              return;
            }

            try {
              // Parse the date string to a Date object
              const date = typeof item.fecha === 'string' ? parseISO(item.fecha) : new Date(item.fecha);
              
              // Get hour in UTC since the dates in Supabase are stored in UTC
              const hour = date.getUTCHours();
              
              // Filter for hours between configured time range
              if (hour >= startHour && hour <= endHour) {
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
          console.log('Power maximum data processed:', formattedData.length);
        });
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
