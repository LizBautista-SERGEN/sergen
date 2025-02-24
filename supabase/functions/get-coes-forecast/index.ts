
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
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
    console.log("Iniciando descarga de archivo Excel del COES...");
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
        // Asegurarnos de que la fecha se mantenga en UTC
        const fecha = new Date(row[0]);
        processedData.push({
          fecha: fecha.toISOString(),
          pronostico_diario: parseFloat(row[1]) || 0,
          demanda_real: parseFloat(row[2]) || 0,
          rango_superior: parseFloat(row[3]) || 0,
          rango_inferior: parseFloat(row[4]) || 0,
          reprogramacion: parseFloat(row[5]) || 0
        });
      }
    }

    console.log(`Procesados ${processedData.length} registros`);

    // Update database
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Delete existing data for today
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    console.log('Eliminando datos existentes entre:', today.toISOString(), 'y', tomorrow.toISOString());

    const { error: deleteError } = await supabaseAdmin
      .from('coes_forecast')
      .delete()
      .gte('fecha', today.toISOString())
      .lt('fecha', tomorrow.toISOString());

    if (deleteError) {
      console.error('Error eliminando datos antiguos:', deleteError);
      throw deleteError;
    }

    // Insert new data
    const { error: insertError } = await supabaseAdmin
      .from('coes_forecast')
      .insert(processedData);

    if (insertError) {
      console.error('Error insertando nuevos datos:', insertError);
      throw insertError;
    }

    console.log('Datos actualizados correctamente');

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
