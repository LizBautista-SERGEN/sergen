
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import * as XLSX from 'https://deno.land/x/sheetjs@v0.18.3/xlsx.mjs'

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
    // Get file from request
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file) {
      throw new Error('No file uploaded')
    }

    // Parse Excel file
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' })
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(worksheet)

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Authentication required')
    }

    // Process and insert the data
    const processedData = data.map((row: any) => ({
      date: row.date,
      time: row.time,
      forecasted_power: parseFloat(row.forecasted_power) || 0,
      executed_power: parseFloat(row.executed_power) || 0,
      consumption: parseFloat(row.consumption) || 0,
      demand: parseFloat(row.demand) || 0,
      cost: parseFloat(row.cost) || 0,
      user_id: user.id,
    }))

    const { error: insertError } = await supabase
      .from('energy_data')
      .insert(processedData)

    if (insertError) {
      throw insertError
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    )
  } catch (error) {
    console.error('Error in upload-energy-data function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
