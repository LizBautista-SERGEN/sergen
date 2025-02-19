
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

interface DateRange {
  startDate: string;
  endDate: string;
}

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
    const { startDate, endDate }: DateRange = await req.json();
    console.log('Fechas recibidas:', { startDate, endDate });

    if (!startDate || !endDate) {
      console.error('Fechas faltantes');
      return new Response(
        JSON.stringify({ error: 'Se requieren fechas de inicio y fin' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }

    console.log('Realizando petición al COES...');
    const coesResponse = await fetch('https://www.coes.org.pe/Portal/portalinformacion/demanda/demandamaximadiaria', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
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
        count: formattedData.length 
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
