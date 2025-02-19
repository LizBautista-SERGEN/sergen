
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as XLSX from 'https://esm.sh/xlsx@0.18.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { fileName, fileContent } = await req.json()

    console.log('Procesando archivo:', fileName)

    // Extraer el contenido Base64 real (remover el prefijo data:...;base64,)
    const base64Content = fileContent.split(',')[1]
    const fileBuffer = Uint8Array.from(atob(base64Content), c => c.charCodeAt(0))

    // Leer el archivo Excel
    const workbook = XLSX.read(fileBuffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // Convertir a JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet)

    console.log('Datos extraídos del Excel:', jsonData)

    // Procesar los datos para el formato correcto
    const processedData = jsonData.map((row: any) => {
      // Asumiendo que las columnas del Excel son "Fecha", "Reprogramación Diaria" y "Ejecutado"
      // Convertir la fecha de Excel a formato ISO
      let fecha
      if (typeof row.Fecha === 'number') {
        // Si es un número de serie de Excel
        fecha = new Date(Math.round((row.Fecha - 25569) * 86400 * 1000))
      } else if (typeof row.Fecha === 'string') {
        // Si es una cadena de texto
        fecha = new Date(row.Fecha)
      }

      return {
        fecha: fecha.toISOString(),
        reprogramacion_diaria: row['Reprogramación Diaria'] || row.reprogramacion_diaria || null,
        ejecutado: row.Ejecutado || row.ejecutado || null
      }
    }).filter(row => !isNaN(new Date(row.fecha).getTime())) // Filtrar fechas inválidas

    console.log('Datos procesados:', processedData)

    // Conectar a Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Insertar los datos procesados
    const { data, error } = await supabase
      .from('coes_historical')
      .insert(processedData)
      .select()

    if (error) {
      console.error('Error al insertar datos:', error)
      throw error
    }

    console.log('Datos insertados correctamente:', data)

    return new Response(
      JSON.stringify({
        success: true,
        count: processedData.length,
        message: `Se procesaron ${processedData.length} registros correctamente`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
