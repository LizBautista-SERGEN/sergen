
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

    console.log('Realizando petición al COES...');
    const coesResponse = await fetch('https://www.coes.org.pe/Portal/portalinformacion/demanda/demandamaximadiaria', {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'Origin': 'https://www.coes.org.pe',
        'Referer': 'https://www.coes.org.pe/Portal/portalinformacion/demanda',
      },
      body: JSON.stringify({
        fechaInicial: startDate,
        fechaFinal: endDate
      })
    });

    if (!coesResponse.ok) {
      throw new Error(`Error en la respuesta del COES: ${coesResponse.status} - ${coesResponse.statusText}`);
    }

    const coesData = await coesResponse.json();
    console.log('Datos recibidos del COES:', coesData);

    if (!Array.isArray(coesData)) {
      throw new Error('Formato de datos inesperado del COES');
    }

    console.log('Conectando con Supabase...');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Variables de entorno de Supabase no configuradas');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const formattedData = coesData.map(row => ({
      fecha: row.fecha,
      reprogramacion_diaria: parseFloat(row.reprogramacionDiaria || '0'),
      ejecutado: parseFloat(row.ejecutado || '0'),
      created_at: new Date().toISOString()
    }));

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
        details: error.message 
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
