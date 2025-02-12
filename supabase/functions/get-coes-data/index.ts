
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
    // Eliminar espacios y convertir comas a puntos para decimales
    const cleanValue = value.replace(/\s/g, '').replace(',', '.');
    const number = parseFloat(cleanValue);
    return isNaN(number) ? 0 : number;
  } catch (error) {
    console.error('Error parseando número:', value, error);
    return 0;
  }
};

const formatDateForCOES = (dateStr: string): string => {
  // Convertir de DD/MM/YYYY a MM/DD/YYYY que es el formato que espera el COES
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return `${parts[1]}/${parts[0]}/${parts[2]}`;
  }
  return dateStr;
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

    // Formatear las fechas para el COES
    const formattedFechaInicio = formatDateForCOES(fechaInicio);
    const formattedFechaFin = formatDateForCOES(fechaFin);

    const url = `https://www.coes.org.pe/Portal/portalinformacion/demanda`;
    console.log('URL de consulta:', url);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    console.log('Longitud del HTML recibido:', html.length);

    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");

    if (!document) {
      throw new Error('No se pudo parsear el HTML');
    }

    const data = [];
    const today = new Date().toISOString().split('T')[0];
    const isToday = fechaInicio.includes(today.split('-').reverse().join('/'));

    if (isToday) {
      console.log('Procesando datos de pronóstico para hoy');
      const pronosticoTable = document.querySelector("#tblPronostico");
      if (!pronosticoTable) {
        console.error('No se encontró la tabla de pronóstico');
      }
      const rows = pronosticoTable?.querySelectorAll("tr") || [];
      console.log(`Filas encontradas en tabla de pronóstico: ${rows.length}`);

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
    } else {
      console.log('Procesando datos históricos');
      const demandaTable = document.querySelector("#tblDemanda");
      if (!demandaTable) {
        console.error('No se encontró la tabla de demanda');
      }
      const rows = demandaTable?.querySelectorAll("tr") || [];
      console.log(`Filas encontradas en tabla de demanda: ${rows.length}`);

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
    }

    if (data.length === 0) {
      console.warn('No se encontraron datos para procesar');
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

    console.log(`Total de registros procesados: ${data.length}`);

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
