
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
    const formData = await req.formData()
    const file = formData.get('file')
    
    if (!file || !(file instanceof File)) {
      throw new Error('No file uploaded')
    }

    console.log(`Processing file ${file.name} (${file.size} bytes)`)

    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const rawData = XLSX.utils.sheet_to_json(worksheet)

    console.log(`Raw data from Excel: ${rawData.length} rows`)
    console.log('First few rows:', rawData.slice(0, 3))

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Primero eliminamos datos existentes para evitar duplicados
    const { error: deleteError } = await supabase
      .from('coes_historical')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); 

    if (deleteError) {
      console.error('Error al eliminar datos existentes:', deleteError);
      throw deleteError;
    }

    console.log('Existing data deleted successfully')

    // Formatea los datos antes de insertarlos
    const formattedData = rawData.map((row: any) => {
      try {
        // Detectar el formato de fecha en el archivo Excel
        let fecha;
        if (row["FECHA"]) {
          if (typeof row["FECHA"] === 'number') {
            // Si es un número de serie de Excel
            const excelEpoch = new Date(1899, 11, 30);
            fecha = new Date(excelEpoch.getTime() + row["FECHA"] * 24 * 60 * 60 * 1000);
          } else {
            // Si es una cadena de fecha
            fecha = new Date(row["FECHA"]);
          }
        } else if (row["fecha"]) {
          if (typeof row["fecha"] === 'number') {
            const excelEpoch = new Date(1899, 11, 30);
            fecha = new Date(excelEpoch.getTime() + row["fecha"] * 24 * 60 * 60 * 1000);
          } else {
            fecha = new Date(row["fecha"]);
          }
        }

        if (!fecha || isNaN(fecha.getTime())) {
          console.error(`Invalid date in row:`, row);
          return null;
        }

        // Formatear la fecha al formato específico de PostgreSQL
        const formattedDate = fecha.toISOString();

        // Mapear nombres de columnas que podrían variar
        const demandaProgramada = Number(row["PROG. DIARIA"] || row["demanda_programada"] || 0) || null;
        const reprogramacionDiaria = Number(row["REPROGRAMACIÓN"] || row["reprogramacion_diaria"] || 0) || null;
        const progSemanal = Number(row["PROG. SEMANAL"] || row["prog_semanal"] || 0) || null;
        const ejecutado = Number(row["EJECUTADO"] || row["ejecutado"] || 0) || null;
        const errorPorcentual = Number(row["ERROR %"] || row["error_porcentual"] || 0) || null;

        return {
          fecha: formattedDate,
          demanda_programada: demandaProgramada,
          reprogramacion_diaria: reprogramacionDiaria,
          prog_semanal: progSemanal,
          ejecutado: ejecutado,
          error_porcentual: errorPorcentual
        }
      } catch (error) {
        console.error('Error processing row:', row, error)
        return null;
      }
    }).filter(item => item !== null);

    console.log(`Formatted ${formattedData.length} rows for database insertion`)

    if (formattedData.length === 0) {
      throw new Error('No valid data could be extracted from the Excel file');
    }

    // Realizar la inserción en lotes para evitar problemas con archivos grandes
    const batchSize = 100;
    let insertedCount = 0;
    
    for (let i = 0; i < formattedData.length; i += batchSize) {
      const batch = formattedData.slice(i, i + batchSize);
      const { error: insertError } = await supabase
        .from('coes_historical')
        .insert(batch);

      if (insertError) {
        console.error('Insert error for batch:', insertError);
        throw insertError;
      }
      
      insertedCount += batch.length;
      console.log(`Inserted batch ${i/batchSize + 1}, total records so far: ${insertedCount}`);
    }

    console.log(`Successfully inserted ${insertedCount} records`)

    // Verificar que los datos se insertaron correctamente
    const { count, error: countError } = await supabase
      .from('coes_historical')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error('Error al verificar conteo final:', countError);
    } else {
      console.log(`Final record count in database: ${count}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Datos históricos actualizados correctamente',
        count: insertedCount
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error: any) {
    console.error('Error processing file:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Error procesando el archivo',
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 // Cambiado a 200 para evitar el error de non-2xx
      }
    )
  }
})
