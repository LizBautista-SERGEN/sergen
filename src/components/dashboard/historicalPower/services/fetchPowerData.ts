
import { format, subDays } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PowerData } from "../types";

export const fetchPowerData = async () => {
  try {
    // Get current date
    const today = new Date();
    // Get date from 30 days ago for a smaller range to ensure we get recent data
    const thirtyDaysAgo = subDays(today, 30);
    
    const formattedToday = format(today, 'yyyy-MM-dd');
    const formattedThirtyDaysAgo = format(thirtyDaysAgo, 'yyyy-MM-dd');
    
    console.log("Fetching historical power data...");
    console.log("Date range:", {
      start: formattedThirtyDaysAgo,
      end: formattedToday
    });
    
    // First get the current session to include auth token
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("No active session found. Please log in.");
    }
    
    console.log("Session found, auth token available:", !!session.access_token);
    
    // First, let's try to directly access some data to verify permissions
    console.log("Attempting to directly query coes_historical to verify access...");
    const { data: directData, error: directError, count } = await supabase
      .from('coes_historical')
      .select('*', { count: 'exact' })
      .limit(5);
      
    if (directError) {
      console.error('Error accessing table directly:', directError);
    } else {
      console.log('Direct table access successful, found records:', directData?.length);
      if (directData && directData.length > 0) {
        console.log('Sample records from direct query:');
        directData.forEach((record, i) => {
          console.log(`Record ${i+1}:`, record);
        });
      } else {
        console.log('No records found in direct query.');
        if (count !== null && count !== undefined) {
          console.log(`Total count reported by database: ${count}`);
        }
      }
    }
    
    // Call our edge function to get the historical power data with auth header
    console.log("Calling edge function get-historical-power-data...");
    const response = await supabase.functions.invoke(
      "get-historical-power-data", 
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          start_date: formattedThirtyDaysAgo,
          end_date: formattedToday,
          limit: 10000, // Limit to prevent excessive data
        }
      }
    );
    
    if (response.error) {
      console.error('Edge function error:', response.error);
      throw new Error(`Error from edge function: ${response.error.message}`);
    }

    const data: PowerData[] = response.data;

    if (!data || data.length === 0) {
      console.log("No data found in the specified date range from edge function");
      
      // If we couldn't get data through the edge function but have direct data,
      // use the direct data as fallback
      if (directData && directData.length > 0) {
        console.log("Using direct data as fallback");
        return directData.map(item => ({ 
          fecha: item.fecha,
          ejecutado: item.ejecutado 
        }));
      }
      
      return [];
    }

    console.log(`Retrieved ${data.length} records from edge function`);
    console.log("Sample data from edge function:", data.slice(0, 3));
    
    return data;
  } catch (err: any) {
    console.error('Error fetching power data:', err);
    toast.error("Error al cargar datos históricos de potencia");
    throw err;
  }
};
