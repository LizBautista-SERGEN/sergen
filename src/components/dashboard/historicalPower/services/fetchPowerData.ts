import { format, subDays } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PowerData } from "../types";

export const fetchPowerData = async (): Promise<PowerData[]> => {
  try {
    // Get current date
    const today = new Date();
    // Get date from 30 days ago
    const thirtyDaysAgo = subDays(today, 30);
    
    const formattedToday = format(today, 'yyyy-MM-dd');
    const formattedThirtyDaysAgo = format(thirtyDaysAgo, 'yyyy-MM-dd');
    
    console.log("Fetching historical power data...");
    console.log("Date range:", { start: formattedThirtyDaysAgo, end: formattedToday });
    
    // First, try to directly access coes_historical data to verify table access
    const { data: checkData, error: checkError } = await supabase
      .from('coes_historical')
      .select('fecha, ejecutado')
      .order('fecha', { ascending: true })
      .limit(5);
      
    if (checkError) {
      console.error('Error checking data table access:', checkError);
      throw new Error(`Error accessing data table: ${checkError.message}`);
    }

    console.log("Table access check successful, found sample records:", checkData?.length || 0);
    if (checkData && checkData.length > 0) {
      console.log('Sample records:');
      checkData.forEach((record, i) => {
        console.log(`Record ${i+1}:`, record);
      });
    }
    
    // Now get actual data within the date range
    const { data: rangeData, error: rangeError } = await supabase
      .from('coes_historical')
      .select('fecha, ejecutado')
      .gte('fecha', formattedThirtyDaysAgo)
      .lte('fecha', formattedToday)
      .order('fecha', { ascending: true });
      
    if (rangeError) {
      console.error('Error fetching data in date range:', rangeError);
      throw new Error(`Error fetching data: ${rangeError.message}`);
    }

    if (rangeData && rangeData.length > 0) {
      console.log(`Found ${rangeData.length} records in date range`);
      
      // Filter to keep only records between 18:00 and 24:00 UTC (peak hours)
      const filteredData = rangeData.filter(item => {
        if (!item.fecha) return false;
        const date = new Date(item.fecha);
        const hour = date.getUTCHours();
        return hour >= 18 && hour < 24;
      });
      
      console.log(`Found ${filteredData.length} records in the 18:00-24:00 range`);
      
      // Log the first few records for debugging
      filteredData.slice(0, 5).forEach(item => {
        const date = new Date(item.fecha);
        console.log(`Time (UTC): ${format(date, 'HH:mm:ss')}, Value: ${item.ejecutado}`);
      });
      
      // Find the maximum value for each day
      const dailyMaximums = filteredData.reduce<Record<string, PowerData>>((acc, curr) => {
        const date = new Date(curr.fecha);
        const dateString = format(date, 'yyyy-MM-dd');
        
        if (!acc[dateString] || curr.ejecutado > acc[dateString].ejecutado) {
          acc[dateString] = {
            fecha: curr.fecha,
            ejecutado: curr.ejecutado
          };
        }
        
        return acc;
      }, {});
      
      // Convert to array
      const result = Object.values(dailyMaximums);
      
      if (result.length > 0) {
        const maxValue = result.reduce((max, curr) => 
          curr.ejecutado > max.ejecutado ? curr : max, result[0]);
        console.log(`Selected max value: ${maxValue.ejecutado} at ${format(new Date(maxValue.fecha), 'HH:mm:ss')} UTC`);
      }
      
      return result;
    } else {
      console.log("No data found in the specified date range from direct query");
    }
    
    // If no direct data access or no data within the period, try the edge function
    console.log("No data found in direct query. Calling edge function get-historical-power-data...");
    
    // Get session for auth
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("No active session found. Please log in.");
    }
    
    console.log("Session found, auth token available:", !!session.access_token);
    
    // Call edge function as fallback
    const response = await supabase.functions.invoke(
      "get-historical-power-data", 
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          start_date: formattedThirtyDaysAgo,
          end_date: formattedToday,
          limit: 10000,
        }
      }
    );
    
    if (response.error) {
      throw new Error(`Error from edge function: ${response.error.message}`);
    }

    const edgeFunctionData = response.data as PowerData[];

    if (!edgeFunctionData || edgeFunctionData.length === 0) {
      console.log("No data found in the specified date range from edge function");
      return [];
    }

    console.log(`Retrieved ${edgeFunctionData.length} records from edge function`);
    return edgeFunctionData;
  } catch (err: any) {
    console.error('Error fetching power data:', err);
    toast.error("Error al cargar datos históricos de potencia");
    throw err;
  }
};
