
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
    
    // First try direct query with appropriate headers
    const { data, error } = await supabase
      .from('coes_historical')
      .select('fecha, ejecutado')
      .gte('fecha', formattedThirtyDaysAgo)
      .lte('fecha', formattedToday)
      .not('ejecutado', 'is', null);
    
    if (error) {
      console.error('Error in direct query:', error);
      console.log("No data found in direct query. Calling edge function get-historical-power-data...");
      
      // Get session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No authenticated session found');
        return [];
      }
      
      console.log("Session found, auth token available:", !!session.access_token);
      
      // Call the edge function with proper authentication
      const { data: edgeFunctionData, error: edgeFunctionError } = await supabase.functions.invoke(
        'get-historical-power-data',
        {
          body: {
            start_date: formattedThirtyDaysAgo,
            end_date: formattedToday,
            limit: 10000
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        }
      );
      
      if (edgeFunctionError) {
        console.error('Error in edge function:', edgeFunctionError);
        throw new Error(`Edge function error: ${edgeFunctionError.message}`);
      }
      
      if (!edgeFunctionData || edgeFunctionData.length === 0) {
        console.log("No data found in the specified date range from edge function");
        return [];
      }
      
      // Process the data from edge function
      const result: PowerData[] = edgeFunctionData.map(item => ({
        fecha: item.fecha,
        ejecutado: item.ejecutado || 0
      }));
      
      return result;
    }
    
    if (!data || data.length === 0) {
      console.log("No data found in the specified date range from direct query");
      console.log("No data found in direct query. Calling edge function get-historical-power-data...");
      
      // Get session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No authenticated session found');
        return [];
      }
      
      console.log("Session found, auth token available:", !!session.access_token);
      
      // Call the edge function with proper authentication
      const { data: edgeFunctionData, error: edgeFunctionError } = await supabase.functions.invoke(
        'get-historical-power-data',
        {
          body: {
            start_date: formattedThirtyDaysAgo,
            end_date: formattedToday,
            limit: 10000
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        }
      );
      
      if (edgeFunctionError) {
        console.error('Error in edge function:', edgeFunctionError);
        throw new Error(`Edge function error: ${edgeFunctionError.message}`);
      }
      
      if (!edgeFunctionData || edgeFunctionData.length === 0) {
        console.log("No data found in the specified date range from edge function");
        return [];
      }
      
      // Process the data from edge function
      const result: PowerData[] = edgeFunctionData.map(item => ({
        fecha: item.fecha,
        ejecutado: item.ejecutado || 0
      }));
      
      return result;
    }
    
    console.log(`Retrieved ${data.length} records directly from database`);
    
    // Filter for peak hours (18:00-24:00 UTC)
    const peakHoursData = data.filter(item => {
      if (!item.fecha) return false;
      const date = new Date(item.fecha);
      const hour = date.getUTCHours();
      return hour >= 18 && hour < 24;
    });
    
    console.log(`Found ${peakHoursData.length} records during peak hours (18:00-24:00 UTC)`);
    
    // Make a proper typed result
    const result: PowerData[] = peakHoursData.map(item => ({
      fecha: item.fecha,
      ejecutado: item.ejecutado || 0
    }));
    
    return result;
  } catch (err: any) {
    console.error('Error in fetchPowerData:', err);
    toast.error("Error al cargar datos históricos de potencia");
    return [];
  }
};
