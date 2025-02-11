
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

// Helper function to parse Excel date
function parseExcelDate(serial: number): string {
  const date = new Date(Math.round((serial - 25569) * 86400 * 1000));
  return date.toISOString().split('T')[0];
}

// Helper function to process a single row
function processRow(row: any, userId: string): any | null {
  if (!row.FECHA || !row.HORA) {
    return null;
  }

  const date = typeof row.FECHA === 'number' 
    ? parseExcelDate(row.FECHA)
    : row.FECHA instanceof Date 
      ? row.FECHA.toISOString().split('T')[0]
      : row.FECHA;

  const time = typeof row.HORA === 'number'
    ? new Date(row.HORA * 24 * 60 * 60 * 1000).toISOString().split('T')[1].substring(0, 5)
    : row.HORA;

  return {
    date,
    time,
    forecasted_power: parseFloat(row["PRONÓSTICO"]) || 0,
    executed_power: parseFloat(row.EJECUTADO) || 0,
    consumption: 0, // Default values as they might not be in the Excel
    demand: 0,
    cost: 0,
    user_id: userId,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Authentication required');
    }

    const formData = await req.formData();
    const file = formData.get('file');
    if (!file) {
      throw new Error('No file uploaded');
    }

    // Reduce memory usage by processing smaller chunks
    const BATCH_SIZE = 50;
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { 
      type: 'array',
      cellDates: true,
      cellNF: false,
      cellText: false,
      sheetRows: 1000 // Limit rows to process at once
    });
    
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);
    const processedData = [];

    console.log('Starting processing of', data.length, 'rows');
    
    for (let i = 0; i < data.length; i++) {
      const processedRow = processRow(data[i], user.id);
      if (processedRow) {
        processedData.push(processedRow);
      }

      if (processedData.length === BATCH_SIZE || i === data.length - 1) {
        if (processedData.length > 0) {
          const { error: insertError } = await supabase
            .from('energy_data')
            .insert(processedData);

          if (insertError) {
            console.error('Insert error:', insertError);
            throw insertError;
          }

          console.log(`Processed batch of ${processedData.length} rows`);
        }
        processedData.length = 0;
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    );
  } catch (error) {
    console.error('Error in upload-energy-data function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});
