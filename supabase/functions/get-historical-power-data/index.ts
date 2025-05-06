
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
      return new Response(
        JSON.stringify({ code: 401, message: 'Missing authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const { start_date, end_date, limit = 50000 } = await req.json()
    
    if (!start_date || !end_date) {
      return new Response(
        JSON.stringify({ error: 'Missing required date parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } }
      }
    )

    console.log(`Fetching historical power data from ${start_date} to ${end_date} with limit ${limit}`)
    
    // Use pagination to fetch all records
    let allData = [];
    let page = 0;
    let hasMore = true;
    const pageSize = 1000; // Supabase may have a default limit of 1000
    
    while (hasMore) {
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

    return new Response(
      JSON.stringify(allData),
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
