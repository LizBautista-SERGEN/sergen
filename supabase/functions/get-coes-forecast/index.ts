
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.31.0'
import * as XLSX from 'npm:xlsx@0.18.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log("Obteniendo archivo Excel del COES...");
    const response = await fetch('https://www.coes.org.pe//Portal/portalinformacion/ExportarPronosticoTiempoReal');
    
    if (!response.ok) {
      throw new Error(`Error al descargar el archivo: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
    
    // Asumimos que los datos están en la primera hoja
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Configuramos para obtener los datos con encabezados
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    console.log("Datos del Excel:", jsonData);

    // Procesamos los datos exactamente como vienen en el Excel
    const data = jsonData.map((row: any) => {
      const entries = Object.entries(row);
      // Asumiendo que las columnas están en el orden: Fecha, Pronóstico, Reprogramación, Mínimo, Máximo, Ejecutado
      return {
        fecha: entries[0][1],  // Primera columna (fecha)
        pronostico: typeof entries[1]?.[1] === 'number' ? entries[1][1] : null,
        reprogramacion_diaria: typeof entries[2]?.[1] === 'number' ? entries[2][1] : null,
        rango_minimo: typeof entries[3]?.[1] === 'number' ? entries[3][1] : null,
        rango_maximo: typeof entries[4]?.[1] === 'number' ? entries[4][1] : null,
        ejecutado: typeof entries[5]?.[1] === 'number' ? entries[5][1] : null
      };
    });

    console.log("Datos procesados:", data);

    // Guardar los datos en Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    for (const item of data) {
      const { error } = await supabase
        .from('coes_forecast')
        .upsert({
          fecha: new Date(item.fecha),
          pronostico: item.pronostico,
          reprogramacion_diaria: item.reprogramacion_diaria,
          rango_minimo: item.rango_minimo,
          rango_maximo: item.rango_maximo,
          ejecutado: item.ejecutado
        }, {
          onConflict: 'fecha'
        });

      if (error) {
        console.error('Error insertando datos:', error);
      }
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      },
    )
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      },
    )
  }
})
