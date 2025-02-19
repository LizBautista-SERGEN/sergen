
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('Iniciando función get-coes-historical');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    // Obtener los datos del body
    const { startDate, endDate } = await req.json();
    console.log('Fechas recibidas:', { startDate, endDate });

    // Obtener la página principal primero para las cookies
    console.log('Obteniendo página principal...');
    const initialResponse = await fetch('https://www.coes.org.pe/Portal/portalinformacion/demanda', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!initialResponse.ok) {
      throw new Error(`Error al acceder a la página principal: ${initialResponse.status}`);
    }

    // Obtener cookies de la respuesta inicial
    const cookies = initialResponse.headers.get('set-cookie');
    console.log('Cookies obtenidas:', cookies);

    // Hacer la petición al formulario de demanda máxima diaria
    console.log('Realizando petición de datos...');
    const formResponse = await fetch('https://www.coes.org.pe/Portal/portalinformacion/demanda/demandamaximadiaria', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies || '',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
        'Origin': 'https://www.coes.org.pe',
        'Referer': 'https://www.coes.org.pe/Portal/portalinformacion/demanda'
      },
      body: JSON.stringify({
        fechaInicial: startDate,
        fechaFinal: endDate
      })
    });

    // Verificar la respuesta
    if (!formResponse.ok) {
      throw new Error(`Error al obtener datos: ${formResponse.status}`);
    }

    // Obtener el contenido de la respuesta
    const htmlContent = await formResponse.text();
    console.log('Contenido HTML recibido:', htmlContent.substring(0, 500)); // Solo los primeros 500 caracteres para el log

    // Intentar extraer los datos del HTML
    // Asumiendo que los datos vienen en formato JSON dentro del HTML
    const dataMatch = htmlContent.match(/var\s+data\s*=\s*(\[.*?\]);/s);
    if (!dataMatch) {
      throw new Error('No se encontraron datos en la respuesta');
    }

    // Parsear los datos encontrados
    let rawData;
    try {
      rawData = JSON.parse(dataMatch[1]);
      console.log('Datos extraídos:', rawData);
    } catch (e) {
      throw new Error(`Error al parsear datos encontrados: ${e.message}`);
    }

    // Verificar y formatear los datos
    if (!Array.isArray(rawData)) {
      throw new Error('Los datos extraídos no están en el formato esperado');
    }

    // Formatear los datos para la base de datos
    const formattedData = rawData.map(row => ({
      fecha: row.fecha,
      reprogramacion_diaria: parseFloat(row.reprogramacionDiaria || '0'),
      ejecutado: parseFloat(row.ejecutado || '0'),
      created_at: new Date().toISOString()
    }));

    if (formattedData.length === 0) {
      throw new Error('No se encontraron datos para procesar');
    }

    console.log('Datos formateados:', formattedData);

    // Guardar en Supabase
    console.log('Conectando con Supabase...');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Variables de entorno de Supabase no configuradas');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Insertando datos en Supabase...');
    const { error: insertError } = await supabase
      .from('coes_historical')
      .upsert(formattedData);

    if (insertError) {
      console.error('Error al insertar en Supabase:', insertError);
      throw new Error(`Error al insertar datos: ${insertError.message}`);
    }

    console.log('Operación completada con éxito');
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Datos históricos obtenidos y guardados correctamente',
        count: formattedData.length,
        data: formattedData
      }),
      { 
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error en get-coes-historical:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Error al obtener datos históricos',
        details: error.message,
        stack: error.stack
      }),
      { 
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        },
        status: 500 
      }
    );
  }
});
