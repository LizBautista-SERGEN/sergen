
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.1.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fechaInicio, fechaFin } = await req.json();

    if (!fechaInicio || !fechaFin) {
      throw new Error('Las fechas son requeridas');
    }

    console.log('Iniciando scraping de COES para fechas:', { fechaInicio, fechaFin });

    // Realizar petición a la página del COES
    const response = await fetch('https://www.coes.org.pe/Portal/portalinformacion/demanda', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0'
      }
    });

    if (!response.ok) {
      console.error('Error en la respuesta HTTP:', response.status, response.statusText);
      throw new Error(`Error al acceder a la página del COES: ${response.status}`);
    }

    const html = await response.text();
    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");

    if (!document) {
      throw new Error('No se pudo parsear el HTML');
    }

    // Intentar obtener datos del pronóstico
    const pronosticoRows = document.querySelectorAll("#tblPronostico tr");
    const demandaRows = document.querySelectorAll("#tblDemanda tr");
    
    const data = [];
    const today = new Date().toISOString().split('T')[0];
    const isToday = fechaInicio.includes(today);

    if (isToday && pronosticoRows.length > 1) {
      // Procesar datos de pronóstico para el día actual
      pronosticoRows.forEach((row, index) => {
        if (index === 0) return; // Skip header
        const cells = row.querySelectorAll("td");
        if (cells.length >= 4) {
          data.push({
            Fecha: cells[0].textContent?.trim(),
            Ejecutado: parseFloat(cells[1].textContent?.trim().replace(',', '') || '0'),
            "Prog. Diaria": parseFloat(cells[2].textContent?.trim().replace(',', '') || '0'),
            "Prog. Semanal": parseFloat(cells[3].textContent?.trim().replace(',', '') || '0')
          });
        }
      });
    } else if (demandaRows.length > 1) {
      // Procesar datos históricos
      demandaRows.forEach((row, index) => {
        if (index === 0) return; // Skip header
        const cells = row.querySelectorAll("td");
        if (cells.length >= 4) {
          data.push({
            Fecha: cells[0].textContent?.trim(),
            Ejecutado: parseFloat(cells[1].textContent?.trim().replace(',', '') || '0'),
            "Prog. Diaria": parseFloat(cells[2].textContent?.trim().replace(',', '') || '0'),
            "Prog. Semanal": parseFloat(cells[3].textContent?.trim().replace(',', '') || '0')
          });
        }
      });
    }

    // Guardar datos en la base de datos
    for (const item of data) {
      const { error: insertError } = await supabase
        .from('coes_demand_data')
        .upsert({
          date: new Date(item.Fecha).toISOString(),
          executed_power: item.Ejecutado,
          daily_forecast: item["Prog. Diaria"],
          weekly_forecast: item["Prog. Semanal"],
          created_at: new Date()
        });

      if (insertError) {
        console.error('Error al insertar datos:', insertError);
      }
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error en el scraping:', error);
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
