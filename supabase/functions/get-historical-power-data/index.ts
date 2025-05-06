import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // First, verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.log("Missing authorization header");
      return new Response(
        JSON.stringify({ code: 401, message: 'Missing authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    console.log("Authorization header present:", !!authHeader);
    
    const { start_date, end_date, limit = 50000 } = await req.json()
    
    if (!start_date || !end_date) {
      console.log("Missing required date parameters");
      return new Response(
        JSON.stringify({ error: 'Missing required date parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log(`Fetching historical power data from ${start_date} to ${end_date} with limit ${limit}`);
    console.log(`Table being queried: coes_historical`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } }
      }
    )

    // First, get the first 5 records to verify access and data format
    const { data: sampleData, error: sampleError } = await supabase
      .from('coes_historical')
      .select('*')
      .limit(5);
      
    if (sampleError) {
      console.error("Error accessing coes_historical table:", sampleError);
      throw new Error(`Database access error: ${sampleError.message}`);
    }
    
    if (!sampleData || sampleData.length === 0) {
      console.log("WARNING: No records found in the coes_historical table at all!");
    } else {
      console.log(`Successfully accessed coes_historical table. Sample records:`);
      sampleData.forEach((record, index) => {
        console.log(`Record ${index + 1}:`, JSON.stringify(record));
      });
    }

    // Check if there's any data in the table with the date range
    const { data: rangeData, error: rangeError } = await supabase
      .from('coes_historical')
      .select('fecha', { count: 'exact' })
      .gte('fecha', start_date)
      .lte('fecha', end_date)
      .limit(1);
      
    if (rangeError) {
      console.error("Error checking data in date range:", rangeError);
      throw rangeError;
    }
    
    if (!rangeData || rangeData.length === 0) {
      console.log(`WARNING: No records found between ${start_date} and ${end_date}`);
      return new Response(
        JSON.stringify([]),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } else {
      console.log(`Found records in the specified date range. Proceeding with query.`);
    }
    
    // Use pagination to fetch all records within the date range
    let allData = [];
    let page = 0;
    let hasMore = true;
    const pageSize = 1000; // Supabase may have a default limit of 1000
    
    while (hasMore) {
      console.log(`Fetching page ${page + 1}...`);
      const { data, error } = await supabase
        .from('coes_historical')
        .select('fecha, ejecutado')
        .gte('fecha', start_date)
        .lte('fecha', end_date)
        .order('fecha', { ascending: true })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) {
        console.error("Error fetching data:", error);
        throw error;
      }
      
      if (data && data.length > 0) {
        allData = [...allData, ...data];
        page++;
        console.log(`Retrieved page ${page} with ${data.length} records. Total so far: ${allData.length}`);
        
        // Check if we received fewer records than the page size or hit the overall limit
        hasMore = data.length === pageSize && allData.length < limit;
      } else {
        hasMore = false;
      }
    }

    console.log(`Retrieved a total of ${allData.length} records from database`);
    
    if (allData.length === 0) {
      console.log("WARNING: No records found in the database for the specified date range!");
      return new Response(
        JSON.stringify([]),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    console.log("Sample raw data:", allData.slice(0, 5).map(item => JSON.stringify(item)));
    
    // Filter records to keep only those in the 18:00-23:00 UTC range
    const filteredData = allData.filter(item => {
      if (!item.fecha || item.ejecutado == null) {
        console.log("Skipping invalid item:", item);
        return false;
      }
      
      try {
        const date = new Date(item.fecha);
        const hour = date.getUTCHours();
        const isInRange = hour >= 18 && hour <= 23;
        
        if (isInRange) {
          console.log(`Including record: ${date.toISOString()}, Hour: ${hour}, Value: ${item.ejecutado}`);
        }
        
        return isInRange;
      } catch (e) {
        console.error("Error filtering date:", e);
        return false;
      }
    });
    
    console.log(`Found ${filteredData.length} records in the 18:00-23:00 UTC range`);
    
    if (filteredData.length > 0) {
      console.log("Sample filtered data:", filteredData.slice(0, 5).map(item => JSON.stringify(item)));
      filteredData.slice(0, 5).forEach(item => {
        const date = new Date(item.fecha);
        console.log(`Time (UTC): ${date.toISOString()}, Hour: ${date.getUTCHours()}, Value: ${item.ejecutado}`);
      });
    } else {
      console.log("WARNING: No records found in the 18:00-23:00 UTC range!");
    }

    return new Response(
      JSON.stringify(filteredData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
