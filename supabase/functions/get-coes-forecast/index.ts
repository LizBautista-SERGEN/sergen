
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.31.0'
import * as XLSX from 'https://deno.land/x/xlsx@v0.0.2/mod.ts'

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
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Procesar los datos del Excel
    const data = jsonData.map((row: any) => ({
      fecha: Object.values(row)[0], // Primera columna
      pronostico: parseFloat(Object.values(row)[1] as string || '0'),
      reprogramacion_diaria: parseFloat(Object.values(row)[2] as string || '0'),
      rango_minimo: parseFloat(Object.values(row)[3] as string || '0'),
      rango_maximo: parseFloat(Object.values(row)[4] as string || '0'),
      ejecutado: parseFloat(Object.values(row)[5] as string || '0')
    }));

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
