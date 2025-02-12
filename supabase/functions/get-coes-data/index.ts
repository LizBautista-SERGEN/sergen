
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Error al acceder a la página del COES: ${response.status}`);
    }

    const html = await response.text();
    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");

    if (!document) {
      throw new Error('No se pudo parsear el HTML');
    }

    // Extraer datos de la tabla
    const table = document.querySelector("#tblDemanda");
    if (!table) {
      throw new Error('No se encontró la tabla de demanda');
    }

    const rows = table.querySelectorAll("tr");
    const data = [];

    rows.forEach((row, index) => {
      if (index === 0) return; // Skip header row

      const cells = row.querySelectorAll("td");
      if (cells.length >= 4) {
        data.push({
          Fecha: cells[0].textContent.trim(),
          Ejecutado: parseFloat(cells[1].textContent.trim().replace(',', '')) || 0,
          "Prog. Diaria": parseFloat(cells[2].textContent.trim().replace(',', '')) || 0,
          "Prog. Semanal": parseFloat(cells[3].textContent.trim().replace(',', '')) || 0
        });
      }
    });

    console.log('Datos extraídos exitosamente:', data);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error en el scraping:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Error al obtener datos del COES',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
