
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { formatDate } from './utils.ts';
import { searchData, downloadExcel } from './coesApi.ts';
import { processExcelData } from './excelProcessor.ts';
import { saveToDatabase } from './database.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    let formattedDate;
    
    // Check if we received specific dates in the request
    if (req.method === 'POST') {
      const body = await req.json().catch(() => null);
      if (body && body.startDate && body.endDate) {
        formattedDate = formatDate(new Date(body.startDate));
      } else {
        formattedDate = formatDate(new Date());
      }
    } else {
      formattedDate = formatDate(new Date());
    }

    console.log('Iniciando proceso para fecha:', formattedDate);

    // Obtener cookies de la página principal
    const mainPageResponse = await fetch('https://www.coes.org.pe/portal/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (!mainPageResponse.ok) {
      throw new Error(`Error al obtener página principal: ${mainPageResponse.status}`);
    }

    const cookies = mainPageResponse.headers.get('set-cookie') || '';
    console.log('Cookies obtenidas:', cookies ? 'Sí' : 'No');
    
    // Esperar antes de la siguiente petición
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Realizar búsqueda
    const searchResponse = await searchData(formattedDate, cookies);
    if (!searchResponse.ok) {
      throw new Error(`Error en búsqueda: ${searchResponse.status}`);
    }
    console.log('Búsqueda completada');

    // Esperar antes de descargar
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Descargar archivo Excel
    const excelResponse = await downloadExcel(cookies);
    if (!excelResponse.ok) {
      throw new Error(`Error al descargar Excel: ${excelResponse.status}`);
    }

    const arrayBuffer = await excelResponse.arrayBuffer();
    console.log('Tamaño del archivo Excel:', arrayBuffer.byteLength);

    if (arrayBuffer.byteLength === 0) {
      throw new Error('El archivo descargado está vacío');
    }

    // Procesar datos del Excel
    const processedData = await processExcelData(arrayBuffer);
    console.log(`Datos procesados: ${processedData.length} registros`);

    // Guardar en la base de datos si hay datos válidos
    if (processedData.length > 0) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Faltan credenciales de Supabase');
      }

      await saveToDatabase(processedData, supabaseUrl, supabaseKey);
      console.log('Datos guardados en la base de datos');
    }

    return new Response(JSON.stringify(processedData), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      },
      status: 200,
    });

  } catch (error) {
    console.error('Error en el proceso:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Error al obtener datos del COES',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );
  }
});
