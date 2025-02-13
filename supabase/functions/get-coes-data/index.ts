
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { formatDate } from './utils.ts';
import { fetchMainPage, searchData, downloadExcel } from './coesApi.ts';
import { processExcelData } from './excelProcessor.ts';
import { saveToDatabase } from './database.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formattedDate = formatDate(new Date());
    console.log('Iniciando proceso para fecha:', formattedDate);

    // Obtener cookies de la página principal
    const mainPageResponse = await fetchMainPage();
    const cookies = mainPageResponse.headers.get('set-cookie') || '';
    
    // Esperar antes de la siguiente petición
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Realizar búsqueda
    await searchData(formattedDate, cookies);
    console.log('Búsqueda completada');

    // Esperar antes de descargar
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Descargar archivo Excel
    const excelResponse = await downloadExcel(cookies);
    const arrayBuffer = await excelResponse.arrayBuffer();

    if (arrayBuffer.byteLength === 0) {
      throw new Error('El archivo descargado está vacío');
    }

    // Procesar datos del Excel
    const processedData = await processExcelData(arrayBuffer);
    console.log(`Datos procesados: ${processedData.length} registros`);

    // Guardar en la base de datos
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    await saveToDatabase(processedData, supabaseUrl, supabaseKey);

    return new Response(JSON.stringify(processedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

