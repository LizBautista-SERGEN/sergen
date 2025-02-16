
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    console.log('Edge function called successfully');
    
    // Datos de prueba para pronóstico
    const mockData = [
      {
        fecha: new Date().toISOString(),
        pronostico: 4600,
        rango_min: 4300,
        rango_max: 4800
      }
    ];

    return new Response(JSON.stringify(mockData), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 200,
    });

  } catch (error) {
    console.error('Error en el proceso:', error);
    return new Response(JSON.stringify({
      error: 'Error al obtener datos',
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
