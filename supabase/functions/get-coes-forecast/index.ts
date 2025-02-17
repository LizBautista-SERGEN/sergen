
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { processExcelData } from './excelProcessor.ts'
import { saveToDatabase } from './database.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: corsHeaders,
      status: 200
    });
  }

  try {
    console.log("Descargando archivo Excel del COES...");
    const response = await fetch('https://www.coes.org.pe//Portal/portalinformacion/ExportarPronosticoTiempoReal');
    
    if (!response.ok) {
      throw new Error(`Error al descargar el archivo: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const processedData = await processExcelData(arrayBuffer);

    if (!processedData.length) {
      throw new Error('No se encontraron datos en el Excel');
    }

    const count = await saveToDatabase(processedData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: processedData,
        count
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
