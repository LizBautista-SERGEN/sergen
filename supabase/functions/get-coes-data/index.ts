
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { extractCoesData } from './coesApi.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    const data = await extractCoesData();
    
    console.log('Datos extraídos exitosamente:', data.length, 'registros');

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 200,
    });

  } catch (error) {
    console.error('Error en el proceso:', error);
    return new Response(JSON.stringify({
      error: 'Error al obtener datos del COES',
      details: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 500,
    });
  }
});
