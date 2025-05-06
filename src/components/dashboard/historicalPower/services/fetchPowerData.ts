
import { format, subDays } from "date-fns";
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
    
    console.log("Fetching historical power data without filters first...");
    
    // First try direct query with no filters to see if we can get any data at all
    let { data, error } = await supabase
      .from('coes_historical')
      .select('fecha, ejecutado')
      .limit(20);
    
    if (error) {
      console.error('Error in direct query:', error);
      throw new Error(`Database query error: ${error.message}`);
    }
    
    console.log(`Retrieved ${data?.length || 0} records in initial query`);

    // If we have data, now try with the date filters
    if (data && data.length > 0) {
      const { data: filteredData, error: filteredError } = await supabase
        .from('coes_historical')
        .select('fecha, ejecutado')
        .gte('fecha', formattedThirtyDaysAgo)
        .lte('fecha', formattedToday)
        .order('fecha', { ascending: true });
      
      if (filteredError) {
        console.error('Error in filtered query:', filteredError);
      } else if (filteredData && filteredData.length > 0) {
        console.log(`Retrieved ${filteredData.length} records with date filters`);
        data = filteredData;
      }
    } else {
      // If no data in direct query, try the edge function as a fallback
      console.log("No data found in direct query. Calling edge function...");
      
      try {
        const { data: edgeFunctionData, error: edgeFunctionError } = await supabase.functions.invoke(
          'get-historical-power-data',
          {
            body: {
              start_date: formattedThirtyDaysAgo,
              end_date: formattedToday,
              limit: 10000
            }
          }
        );
        
        if (edgeFunctionError) {
          console.error('Error in edge function:', edgeFunctionError);
          throw new Error(`Edge function error: ${edgeFunctionError.message}`);
        }
        
        if (edgeFunctionData && edgeFunctionData.length > 0) {
          console.log(`Retrieved ${edgeFunctionData.length} records from edge function`);
          data = edgeFunctionData;
        } else {
          console.log("No data found from edge function either");
          return [];
        }
      } catch (err) {
        console.error('Error calling edge function:', err);
        throw err;
      }
    }
    
    if (!data || data.length === 0) {
      console.log("No data found after all attempts");
      return [];
    }
    
    console.log(`Retrieved ${data.length} total records, processing...`);

    // Create a proper typed result
    const result: PowerData[] = data
      .filter(item => {
        // Make sure we have valid data
        if (!item.fecha || item.ejecutado === null || item.ejecutado === undefined) {
          return false;
        }
        
        // Filter for peak hours (18:00-23:00 UTC) - moving this filter here instead of in the query
        try {
          const date = new Date(item.fecha);
          const hour = date.getUTCHours();
          console.log(`Record: ${item.fecha}, Hour: ${hour}, Value: ${item.ejecutado}`);
          return hour >= 18 && hour <= 23;
        } catch (e) {
          console.error("Error parsing date:", e, item);
          return false;
        }
      })
      .map(item => ({
        fecha: item.fecha,
        ejecutado: typeof item.ejecutado === 'number' ? item.ejecutado : 0
      }));
    
    console.log(`Found ${result.length} records during peak hours (18:00-23:00 UTC)`);
    
    // Log some sample records for debugging
    if (result.length > 0) {
      result.slice(0, 5).forEach(item => {
        const date = new Date(item.fecha);
        console.log(`Sample: ${date.toISOString()}, Hour: ${date.getUTCHours()}, Value: ${item.ejecutado}`);
      });
    }
    
    return result;
  } catch (err: any) {
    console.error('Error in fetchPowerData:', err);
    throw err;
  }
};
