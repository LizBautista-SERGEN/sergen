
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
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log("Datos crudos del Excel:", rawData);

    // Eliminamos la primera fila (encabezados)
    const dataRows = rawData.slice(1);

    // Procesamos los datos
    const data = dataRows.map((row: any) => {
      if (!Array.isArray(row) || row.length < 6) {
        console.warn('Fila inválida:', row);
        return null;
      }
      
      return {
        fecha: row[0],
        pronostico: typeof row[1] === 'number' ? row[1] : null,
        reprogramacion_diaria: typeof row[2] === 'number' ? row[2] : null,
        rango_minimo: typeof row[3] === 'number' ? row[3] : null,
        rango_maximo: typeof row[4] === 'number' ? row[4] : null,
        ejecutado: typeof row[5] === 'number' ? row[5] : null
      };
    }).filter(item => item !== null);

    console.log("Datos procesados:", data);

    // Guardar los datos en Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let successCount = 0;
    let errorCount = 0;

    for (const item of data) {
      const { error } = await supabase
        .from('coes_forecast')
        .upsert({
          fecha: new Date(item.fecha).toISOString(),
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
        errorCount++;
      } else {
        successCount++;
      }
    }

    console.log(`Registros procesados: ${successCount} exitosos, ${errorCount} errores`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data,
        stats: {
          totalProcessed: data.length,
          successCount,
          errorCount
        }
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
