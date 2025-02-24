
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
    const data = XLSX.utils.sheet_to_json(worksheet)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Formatea los datos antes de insertarlos
    const formattedData = data.map((row: any) => {
      // Asegúrate de que la fecha esté en el formato correcto
      let fecha = new Date(row.fecha)
      if (isNaN(fecha.getTime())) {
        // Si la fecha no es válida, intenta convertir desde Excel serial number
        const excelEpoch = new Date(1899, 11, 31)
        fecha = new Date(excelEpoch.getTime() + (row.fecha - 1) * 24 * 60 * 60 * 1000)
      }

      return {
        fecha: fecha.toISOString().replace('T', ' ').replace('Z', '+00'),
        demanda_programada: row.demanda_programada,
        reprogramacion_diaria: row.reprogramacion_diaria,
        prog_semanal: row.prog_semanal,
        error_porcentual: row.error_porcentual,
        ejecutado: row.ejecutado
      }
    })

    // Realiza la inserción
    const { error: insertError } = await supabase
      .from('coes_historical')
      .insert(formattedData)

    if (insertError) throw insertError

    return new Response(
      JSON.stringify({ success: true, message: 'Datos históricos actualizados correctamente' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error processing file:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
