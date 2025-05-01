
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { start_date, end_date, limit = 50000 } = await req.json()
    
    if (!start_date || !end_date) {
      return new Response(
        JSON.stringify({ error: 'Missing required date parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`Fetching historical power data from ${start_date} to ${end_date} with limit ${limit}`)
    
    const { data, error } = await supabase
      .from('coes_historical')
      .select('fecha, ejecutado')
      .gte('fecha', start_date)
      .lte('fecha', end_date)
      .order('fecha', { ascending: true })
      .limit(limit) // Increased to 50000 to ensure we get all records

    if (error) {
      console.error("Error fetching data:", error)
      throw error
    }

    console.log(`Retrieved ${data?.length || 0} records from database`)

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error("Function error:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
