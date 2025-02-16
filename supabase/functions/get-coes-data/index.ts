
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
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 204,
    });
  }

  // Early auth check
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'No autorizado' }),
      {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  try {
    if (req.method !== 'POST') {
      throw new Error('Método no permitido');
    }

    let formattedDate;
    try {
      const body = await req.json();
      formattedDate = body.startDate ? formatDate(new Date(body.startDate)) : formatDate(new Date());
      console.log('Fecha formateada:', formattedDate);
    } catch (error) {
      console.error('Error parsing request body:', error);
      formattedDate = formatDate(new Date());
    }

    // Obtener cookies de la página principal con retry
    let mainPageResponse;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        mainPageResponse = await fetch('https://www.coes.org.pe/portal/', {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          },
          redirect: 'follow',
        });
        
        if (mainPageResponse.ok) {
          console.log('Página principal obtenida correctamente');
          break;
        }
        
        console.log(`Intento ${retryCount + 1}: Status ${mainPageResponse.status}`);
      } catch (error) {
        console.error(`Intento ${retryCount + 1} fallido:`, error);
      }
      retryCount++;
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
    }

    if (!mainPageResponse?.ok) {
      throw new Error(`Error al obtener página principal después de ${maxRetries} intentos`);
    }

    const cookies = mainPageResponse.headers.get('set-cookie') || '';
    console.log('Cookies obtenidas:', cookies ? 'Sí' : 'No');
    
    // Esperar antes de la siguiente petición
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Realizar búsqueda
    const searchResponse = await searchData(formattedDate, cookies);
    console.log('Búsqueda completada');

    // Esperar antes de descargar
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Descargar archivo Excel
    const excelResponse = await downloadExcel(cookies);
    const arrayBuffer = await excelResponse.arrayBuffer();
    console.log('Tamaño del archivo Excel:', arrayBuffer.byteLength);

    if (arrayBuffer.byteLength === 0) {
      throw new Error('El archivo descargado está vacío');
    }

    // Procesar datos del Excel
    const processedData = await processExcelData(arrayBuffer);
    console.log(`Datos procesados: ${processedData.length} registros`);

    return new Response(
      JSON.stringify(processedData),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error en el proceso:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Error al obtener datos del COES',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      }
    );
  }
});
