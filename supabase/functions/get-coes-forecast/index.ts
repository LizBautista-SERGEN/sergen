
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { read, utils } from 'npm:xlsx';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Descargando archivo Excel del COES...");
    const response = await fetch('https://www.coes.org.pe/Portal/portalinformacion/ExportarPronosticoTiempoReal');
    
    if (!response.ok) {
      throw new Error(`Error al descargar el archivo: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const workbook = read(arrayBuffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = utils.sheet_to_json(worksheet, { header: 1 });

    // Skip header rows and process data
    const processedData = [];
    for (let i = 2; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (row && row[0]) {
        const fecha = row[0];
        processedData.push({
          fecha: new Date(fecha).toISOString(),
          pronostico_diario: parseFloat(row[1]) || null,
          demanda_real: parseFloat(row[2]) || null,
          rango_superior: parseFloat(row[3]) || null,
          rango_inferior: parseFloat(row[4]) || null,
          reprogramacion: parseFloat(row[5]) || null
        });
      }
    }

    // Update database
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // First, delete old data for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { error: deleteError } = await supabaseAdmin
      .from('coes_forecast')
      .delete()
      .gte('fecha', today.toISOString())
      .lt('fecha', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString());

    if (deleteError) {
      console.error('Error deleting old data:', deleteError);
      throw deleteError;
    }

    // Insert new data
    const { error: insertError } = await supabaseAdmin
      .from('coes_forecast')
      .insert(processedData);

    if (insertError) {
      console.error('Error inserting new data:', insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Datos actualizados correctamente',
        count: processedData.length 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    );
  }
})
