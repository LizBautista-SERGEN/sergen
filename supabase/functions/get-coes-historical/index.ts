
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.1.0';
import { extractCoesData } from '../get-coes-data/coesApi.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Iniciando extracción de datos históricos...');
    const historicalData = await extractCoesData();

    if (!historicalData || historicalData.length === 0) {
      throw new Error('No se obtuvieron datos del COES');
    }

    console.log(`Se obtuvieron ${historicalData.length} registros`);

    // Guardar en Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase
      .from('coes_historical')
      .upsert(
        historicalData,
        { 
          onConflict: 'fecha',
          ignoreDuplicates: false
        }
      );

    if (error) {
      console.error('Error al guardar datos:', error);
      throw error;
    }

    console.log(`Guardados ${historicalData.length} registros correctamente`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Datos actualizados correctamente',
        count: historicalData.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
