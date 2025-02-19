
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function getFormattedDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

serve(async (req) => {
  console.log('Iniciando función get-coes-historical');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    // Calcular fechas automáticamente (últimos 3 días)
    const currentDate = new Date();
    const initialDate = new Date(currentDate);
    initialDate.setDate(currentDate.getDate() - 3);
    const finalDate = new Date(currentDate);
    finalDate.setDate(currentDate.getDate() - 1);

    const startDate = getFormattedDate(initialDate);
    const endDate = getFormattedDate(finalDate);

    console.log('Fechas calculadas:', { startDate, endDate });

    // Primera petición para obtener el token CSRF
    const initialResponse = await fetch('https://www.coes.org.pe/Portal/portalinformacion/demanda', {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    console.log('Estado de respuesta inicial:', initialResponse.status);

    console.log('Realizando petición al COES...');
    const coesResponse = await fetch('https://www.coes.org.pe/Portal/portalinformacion/demanda/demandamaximadiaria', {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'Origin': 'https://www.coes.org.pe',
        'Referer': 'https://www.coes.org.pe/Portal/portalinformacion/demanda',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      body: JSON.stringify({
        fechaInicial: startDate,
        fechaFinal: endDate
      })
    });

    if (!coesResponse.ok) {
      throw new Error(`Error en la respuesta del COES: ${coesResponse.status} - ${coesResponse.statusText}`);
    }

    const responseText = await coesResponse.text();
    console.log('Respuesta raw del COES:', responseText);

    let coesData;
    try {
      coesData = JSON.parse(responseText);
      console.log('Datos parseados del COES:', coesData);
    } catch (e) {
      throw new Error(`Error al parsear respuesta del COES: ${e.message}\nRespuesta recibida: ${responseText}`);
    }

    if (!coesData || typeof coesData !== 'object') {
      throw new Error(`Formato de datos inválido del COES. Recibido: ${typeof coesData}`);
    }

    // Verificar si es un array o si necesitamos extraer los datos de alguna propiedad
    const dataArray = Array.isArray(coesData) ? coesData : coesData.data || coesData.results;

    if (!Array.isArray(dataArray)) {
      throw new Error(`No se encontró un array de datos válido. Estructura recibida: ${JSON.stringify(coesData)}`);
    }

    console.log('Conectando con Supabase...');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Variables de entorno de Supabase no configuradas');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const formattedData = dataArray.map(row => ({
      fecha: row.fecha,
      reprogramacion_diaria: parseFloat(row.reprogramacionDiaria || '0'),
      ejecutado: parseFloat(row.ejecutado || '0'),
      created_at: new Date().toISOString()
    }));

    console.log('Datos formateados:', formattedData);

    if (formattedData.length === 0) {
      throw new Error('No se encontraron datos para procesar');
    }

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
