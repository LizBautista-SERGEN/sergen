
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
    
    // Use authentication to fetch data
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('No authenticated session found');
      return [];
    }
    
    // Query the coes_historical table directly with correct filtering
    const { data, error } = await supabase
      .from('coes_historical')
      .select('fecha, ejecutado')
      .gte('fecha', formattedThirtyDaysAgo)
      .lte('fecha', formattedToday)
      .not('ejecutado', 'is', null)
      .order('fecha', { ascending: true });
    
    if (error) {
      console.error('Error fetching coes_historical data:', error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    console.log(`Retrieved ${data?.length || 0} records from coes_historical`);
    
    if (!data || data.length === 0) {
      console.log('No data found in the specified date range');
      return [];
    }
    
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
