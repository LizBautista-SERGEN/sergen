
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { format } from 'https://deno.land/std@0.168.0/datetime/mod.ts'

interface DateRange {
  startDate: string;
  endDate: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    })
  }

  try {
    const { startDate, endDate }: DateRange = await req.json()

    if (!startDate || !endDate) {
      return new Response(
        JSON.stringify({ error: 'Se requieren fechas de inicio y fin' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      )
    }

    // Hacer la petición directa a la API del COES
    const coesResponse = await fetch('https://www.coes.org.pe/Portal/portalinformacion/demanda/demandamaximadiaria', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fechaInicial: startDate,
        fechaFinal: endDate
      })
    });

    if (!coesResponse.ok) {
      throw new Error(`Error en la respuesta del COES: ${coesResponse.statusText}`);
    }

    const coesData = await coesResponse.json();
    
    if (!Array.isArray(coesData)) {
      throw new Error('Formato de datos inesperado del COES');
    }

    // Guardar los datos en Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const formattedData = coesData.map(row => ({
      fecha: row.fecha,
      reprogramacion_diaria: parseFloat(row.reprogramacionDiaria || '0'),
      ejecutado: parseFloat(row.ejecutado || '0'),
      created_at: new Date().toISOString()
    }));

    const { error: insertError } = await supabase
      .from('coes_historical')
      .upsert(formattedData);

    if (insertError) {
      throw new Error(`Error al insertar datos: ${insertError.message}`);
    }

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
