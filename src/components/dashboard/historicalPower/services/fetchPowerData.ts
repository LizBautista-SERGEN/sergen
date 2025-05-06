
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
    
    // First, try to directly access coes_historical data
    const { data: directData, error: directError } = await supabase
      .from('coes_historical')
      .select('fecha, ejecutado')
      .order('fecha', { ascending: true })
      .limit(100);
      
    if (directError) {
      console.error('Error accessing table directly:', directError);
      throw new Error(`Error accessing data directly: ${directError.message}`);
    }

    if (directData && directData.length > 0) {
      console.log('Direct data access successful, found records:', directData.length);
      console.log('Sample records from direct query:');
      directData.slice(0, 5).forEach((record, i) => {
        console.log(`Record ${i+1}:`, record);
      });
      
      // If direct access works, return this data
      return directData.map(item => ({ 
        fecha: item.fecha,
        ejecutado: item.ejecutado 
      }));
    }
    
    // If no data from direct access, try the edge function
    console.log("No data from direct query. Trying edge function...");
    
    // Get session for auth
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("No active session found. Please log in.");
    }
    
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

    const data: PowerData[] = response.data;

    if (!data || data.length === 0) {
      console.log("No data found from edge function either");
      return [];
    }

    console.log(`Retrieved ${data.length} records from edge function`);
    return data;
  } catch (err: any) {
    console.error('Error fetching power data:', err);
    toast.error("Error al cargar datos históricos de potencia");
    throw err;
  }
};
