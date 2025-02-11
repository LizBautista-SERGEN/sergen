
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import * as XLSX from 'https://deno.land/x/sheetjs@v0.18.3/xlsx.mjs'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

function parseExcelDate(serial: number | string | Date): string {
  if (serial instanceof Date) {
    return serial.toISOString().split('T')[0];
  }
  if (typeof serial === 'string') {
    // Si es una fecha en formato ISO
    if (serial.includes('T')) {
      return serial.split('T')[0];
    }
    // Si es una fecha en formato DD/MM/YYYY
    const parts = serial.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }
  // Si es un número serial de Excel
  const date = new Date(Math.round((serial as number - 25569) * 86400 * 1000));
  return date.toISOString().split('T')[0];
}

function getTimeFromDate(date: string | Date): string {
  if (typeof date === 'string' && date.includes('T')) {
    return date.split('T')[1].substring(0, 5);
  }
  if (date instanceof Date) {
    return date.toTimeString().substring(0, 5);
  }
  return "00:00"; // tiempo por defecto
}

function processRow(row: any, userId: string): any | null {
  console.log('Processing row:', row);

  // Verificar la existencia de los campos requeridos
  if (!row.FECHA || (!row.EJECUTADO && row.EJECUTADO !== 0) || (!row["PRONÓSTICO"] && row["PRONÓSTICO"] !== 0)) {
    console.error('Skipping row due to missing required fields:', row);
    return null;
  }

  try {
    const dateValue = row.FECHA;
    const date = parseExcelDate(dateValue);
    const time = getTimeFromDate(dateValue);

    const processedRow = {
      date,
      time,
      forecasted_power: parseFloat(row["PRONÓSTICO"].toString()) || 0,
      executed_power: parseFloat(row.EJECUTADO.toString()) || 0,
      user_id: userId,
    };

    console.log('Processed row:', processedRow);
    return processedRow;
  } catch (error) {
    console.error('Error processing row:', error);
    return null;
  }
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

    // Borrar todos los datos existentes antes de la nueva carga
    const { error: deleteError } = await supabase
      .from('energy_data')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      throw deleteError;
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { 
      type: 'array',
      cellDates: true,
      cellNF: false,
      cellText: false,
      dateNF: 'dd/mm/yyyy'
    });
    
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log('Excel data:', data);

    const BATCH_SIZE = 50;
    const processedData = [];

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
