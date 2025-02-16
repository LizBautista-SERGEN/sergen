
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.31.0'
import * as XLSX from 'npm:xlsx@0.18.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function processExcelData(arrayBuffer: ArrayBuffer) {
  const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  console.log('Datos crudos del Excel:', rawData);

  // Procesar los datos, eliminando la primera fila (encabezados)
  return rawData.slice(1)
    .filter((row: any[]) => Array.isArray(row) && row.length >= 6)
    .map((row: any[]) => ({
      fecha: new Date(row[0]).toISOString(),
      pronostico: typeof row[1] === 'number' ? row[1] : null,
      reprogramacion_diaria: typeof row[2] === 'number' ? row[2] : null,
      rango_minimo: typeof row[3] === 'number' ? row[3] : null,
      rango_maximo: typeof row[4] === 'number' ? row[4] : null,
      ejecutado: typeof row[5] === 'number' ? row[5] : null
    }));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log("Descargando archivo Excel del COES...");
    const response = await fetch('https://www.coes.org.pe//Portal/portalinformacion/ExportarPronosticoTiempoReal');
    
    if (!response.ok) {
      throw new Error(`Error al descargar el archivo: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const processedData = await processExcelData(arrayBuffer);

    console.log("Datos procesados:", processedData);

    // Guardar los datos en Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Insertar datos en lotes
    const { error } = await supabase
      .from('coes_forecast')
      .upsert(processedData, {
        onConflict: 'fecha'
      });

    if (error) {
      console.error('Error insertando datos:', error);
      throw error;
    }

    console.log(`Se procesaron ${processedData.length} registros correctamente`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: processedData,
        count: processedData.length
      }),
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
