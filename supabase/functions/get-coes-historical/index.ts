
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.1.0';
import { format, subDays } from 'https://esm.sh/date-fns@2.30.0';
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const today = new Date();
    const startDate = subDays(today, 3);
    const endDate = subDays(today, 1);

    const formattedStartDate = format(startDate, 'dd/MM/yyyy');
    const formattedEndDate = format(endDate, 'dd/MM/yyyy');

    console.log(`Obteniendo datos desde ${formattedStartDate} hasta ${formattedEndDate}`);

    // URL del COES
    const url = `https://www.coes.org.pe/Portal/portalinformacion/demanda`;

    // Primera petición para obtener cookies y tokens
    const initialResponse = await fetch(url);
    const cookies = initialResponse.headers.get('set-cookie');

    // Realizar la consulta con las fechas
    const formData = new FormData();
    formData.append('txtFechaInicial', formattedStartDate);
    formData.append('txtFechaFinal', formattedEndDate);
    formData.append('btnConsultar', 'Consultar');

    const dataResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Cookie': cookies || '',
      },
      body: formData,
    });

    const htmlContent = await dataResponse.text();
    
    // Parsear el HTML para extraer los datos
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    
    if (!doc) {
      throw new Error('No se pudo parsear el HTML');
    }

    // Encontrar la tabla con los datos
    const rows = doc.querySelectorAll("#dgDemanda tr");
    const historicalData = [];

    for (let i = 1; i < rows.length; i++) { // Empezamos desde 1 para saltar el header
      const row = rows[i];
      const cells = row.querySelectorAll("td");
      
      if (cells.length >= 3) {
        const fechaStr = cells[0]?.textContent?.trim();
        const reprogramacionStr = cells[1]?.textContent?.trim();
        const ejecutadoStr = cells[2]?.textContent?.trim();

        if (fechaStr) {
          const [dia, mes, año, hora, minuto] = fechaStr.split(/[\/\s:]/).map(n => parseInt(n, 10));
          const fecha = new Date(año, mes - 1, dia, hora, minuto);

          const data = {
            fecha: fecha.toISOString(),
            reprogramacion_diaria: reprogramacionStr ? parseFloat(reprogramacionStr.replace(',', '.')) : null,
            ejecutado: ejecutadoStr ? parseFloat(ejecutadoStr.replace(',', '.')) : null,
          };

          historicalData.push(data);
        }
      }
    }

    // Guardar en Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (historicalData.length > 0) {
      const { error } = await supabase
        .from('coes_historical')
        .upsert(
          historicalData,
          { 
            onConflict: 'fecha',
            ignoreDuplicates: false
          }
        );

      if (error) {
        console.error('Error al guardar datos:', error);
        throw error;
      }

      console.log(`Guardados ${historicalData.length} registros`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Datos actualizados correctamente',
        count: historicalData.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
