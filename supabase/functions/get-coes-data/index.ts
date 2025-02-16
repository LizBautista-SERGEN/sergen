
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { extractCoesData } from "./coesApi.ts";
import { processExcelData } from "./excelProcessor.ts";

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
    console.log('Iniciando extracción de datos COES...');
    
    // Obtener datos del COES usando Puppeteer
    const coesData = await extractCoesData();
    
    console.log('Datos extraídos exitosamente:', coesData.length, 'registros');

    return new Response(JSON.stringify(coesData), {
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
