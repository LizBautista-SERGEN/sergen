
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import * as XLSX from 'https://deno.land/x/sheetjs@v0.18.3/xlsx.mjs'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize Supabase client outside request handler
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Validate auth token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Get user from token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error('Authentication required')
    }

    // Get and validate file
    const formData = await req.formData()
    const file = formData.get('file')
    if (!file) {
      throw new Error('No file uploaded')
    }

    // Process file in chunks to optimize memory usage
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { 
      type: 'array',
      cellDates: true,
      cellNF: false,
      cellText: false
    })
    
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(worksheet, { 
      raw: true,
      dateNF: 'yyyy-mm-dd'
    })

    // Process data in smaller batches
    const BATCH_SIZE = 100
    const processedData = []
    
    for (let i = 0; i < data.length; i++) {
      const row: any = data[i]
      
      // Validate required fields
      if (!row.date || !row.time) {
        console.error('Skipping row due to missing required fields:', row)
        continue
      }

      // Format date to ensure it's in the correct format (YYYY-MM-DD)
      let formattedDate = row.date
      if (row.date instanceof Date) {
        formattedDate = row.date.toISOString().split('T')[0]
      } else if (typeof row.date === 'number') {
        // Handle Excel serial date numbers
        const date = new Date(Math.round((row.date - 25569) * 86400 * 1000))
        formattedDate = date.toISOString().split('T')[0]
      }

      processedData.push({
        date: formattedDate,
        time: row.time,
        forecasted_power: parseFloat(row.forecasted_power) || 0,
        executed_power: parseFloat(row.executed_power) || 0,
        consumption: parseFloat(row.consumption) || 0,
        demand: parseFloat(row.demand) || 0,
        cost: parseFloat(row.cost) || 0,
        user_id: user.id,
      })

      // Insert in batches
      if (processedData.length === BATCH_SIZE || i === data.length - 1) {
        const { error: insertError } = await supabase
          .from('energy_data')
          .insert(processedData)

        if (insertError) {
          throw insertError
        }

        // Clear the batch
        processedData.length = 0
      }
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
