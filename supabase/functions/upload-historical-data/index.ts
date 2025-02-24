
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { parse } from 'https://deno.land/x/excel@v1.1.2/mod.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      throw new Error('No se proporcionó un archivo válido')
    }

    // Leer el archivo Excel
    const arrayBuffer = await file.arrayBuffer()
    const workbook = parse(new Uint8Array(arrayBuffer))
    const worksheet = workbook.sheets[0]

    if (!worksheet) {
      throw new Error('El archivo no contiene hojas de cálculo')
    }

    // Procesar datos
    const data = []
    for (let i = 1; i < worksheet.rows.length; i++) {
      const row = worksheet.rows[i]
      if (!row[0]) continue // Saltar filas vacías

      // Asumiendo columnas: Fecha, Ejecutado, Prog. Diaria, Prog. Semanal
      const fecha = new Date(row[0])
      if (isNaN(fecha.getTime())) continue

      data.push({
        fecha: fecha.toISOString(),
        ejecutado: parseFloat(row[1] || '0'),
        reprogramacion_diaria: parseFloat(row[2] || '0'),
        created_at: new Date().toISOString()
      })
    }

    // Guardar en Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error } = await supabase
      .from('coes_historical')
      .upsert(data)

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, count: data.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Error al procesar el archivo', 
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
