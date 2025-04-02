
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

    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const rawData = XLSX.utils.sheet_to_json(worksheet)

    console.log('Raw data from Excel:', rawData)

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

        return {
          fecha: formattedDate,
          demanda_programada: Number(row["PROG. DIARIA"] || row["demanda_programada"] || 0) || null,
          reprogramacion_diaria: Number(row["REPROGRAMACIÓN"] || row["reprogramacion_diaria"] || 0) || null,
          prog_semanal: Number(row["PROG. SEMANAL"] || row["prog_semanal"] || 0) || null,
          ejecutado: Number(row["EJECUTADO"] || row["ejecutado"] || 0) || null,
          error_porcentual: Number(row["ERROR %"] || row["error_porcentual"] || 0) || null
        }
      } catch (error) {
        console.error('Error processing row:', row, error)
        return null;
      }
    }).filter(item => item !== null);

    console.log('Formatted data:', formattedData)

    // Realiza la inserción
    const { error: insertError } = await supabase
      .from('coes_historical')
      .insert(formattedData)

    if (insertError) {
      console.error('Insert error:', insertError)
      throw insertError
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Datos históricos actualizados correctamente',
        count: formattedData.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
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
