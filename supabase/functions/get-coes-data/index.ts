
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

const parseNumber = (value: string): number => {
  try {
    if (!value) return 0;
    const cleanValue = value.replace(/\s/g, '').replace(',', '.');
    const number = parseFloat(cleanValue);
    return isNaN(number) ? 0 : number;
  } catch (error) {
    console.error('Error parseando número:', value, error);
    return 0;
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fechaInicio, fechaFin } = await req.json();
    console.log('Fechas recibidas:', { fechaInicio, fechaFin });

    if (!fechaInicio || !fechaFin) {
      throw new Error('Las fechas son requeridas');
    }

    // URL específica para el pronóstico de demanda TR
    const baseUrl = 'https://www.coes.org.pe/Portal/portalinformacion/demanda';
    const pronosticoUrl = `${baseUrl}/PronosticoDemandaTR`;
    console.log('Consultando URL:', pronosticoUrl);

    // Headers comunes para todas las peticiones
    const commonHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Connection': 'keep-alive',
    };

    // Primera petición para obtener cookies y token
    const initResponse = await fetch(pronosticoUrl, {
      headers: commonHeaders,
      redirect: 'follow',
    });

    if (!initResponse.ok) {
      throw new Error(`Error en petición inicial: ${initResponse.status}`);
    }

    const cookies = initResponse.headers.get('set-cookie');
    console.log('Cookies recibidas:', cookies);

    // Segunda petición para obtener los datos
    const formBody = new URLSearchParams({
      'fechaInicial': fechaInicio,
      'fechaFinal': fechaFin,
      'tipoPronostico': '1', // Para pronóstico TR
      'formato': '0'
    });

    const dataResponse = await fetch(`${pronosticoUrl}/ObtenerPronostico`, {
      method: 'POST',
      headers: {
        ...commonHeaders,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://www.coes.org.pe',
        'Referer': pronosticoUrl,
        'Cookie': cookies || '',
        'Upgrade-Insecure-Requests': '1',
      },
      body: formBody.toString(),
      redirect: 'follow',
    });

    if (!dataResponse.ok) {
      console.error('Error en respuesta del COES:', {
        status: dataResponse.status,
        statusText: dataResponse.statusText
      });
      throw new Error(`Error en respuesta del COES: ${dataResponse.status}`);
    }

    const html = await dataResponse.text();
    console.log('Longitud de la respuesta:', html.length);
    console.log('Respuesta HTML:', html);

    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");

    if (!document) {
      throw new Error('No se pudo parsear el HTML');
    }

    // Buscar la tabla de pronóstico
    const tables = document.querySelectorAll("table");
    console.log(`Tablas encontradas: ${tables.length}`);

    let targetTable = null;
    tables.forEach((table, index) => {
      const tableHtml = table.outerHTML;
      console.log(`Contenido de tabla ${index}:`, tableHtml);
      if (tableHtml.includes('Ejecutado') || tableHtml.includes('Prog. Diaria')) {
        targetTable = table;
      }
    });

    if (!targetTable) {
      throw new Error('No se encontró la tabla de datos en la respuesta');
    }

    const data = [];
    const rows = targetTable.querySelectorAll("tr");
    console.log(`Filas encontradas: ${rows.length}`);

    for (let i = 1; i < rows.length; i++) {
      const cells = rows[i].querySelectorAll("td");
      if (cells.length >= 4) {
        const fechaHora = cells[0].textContent?.trim() || '';
        const ejecutado = parseNumber(cells[1].textContent || '0');
        const progDiaria = parseNumber(cells[2].textContent || '0');
        const progSemanal = parseNumber(cells[3].textContent || '0');

        console.log('Datos procesados:', {
          fechaHora,
          ejecutado,
          progDiaria,
          progSemanal
        });

        data.push({
          Fecha: fechaHora,
          Ejecutado: ejecutado,
          "Prog. Diaria": progDiaria,
          "Prog. Semanal": progSemanal
        });
      }
    }

    if (data.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No se encontraron datos para el período seleccionado',
          details: 'La consulta no retornó resultados',
          timestamp: new Date().toISOString()
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Guardar datos en la base de datos
    for (const item of data) {
      const { error: insertError } = await supabase
        .from('coes_demand_data')
        .upsert({
          date: item.Fecha,
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
