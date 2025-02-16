
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const url = `https://www.coes.org.pe/Portal/portalinformacion/demanda`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    if (!doc) {
      throw new Error("Failed to parse HTML");
    }

    // Extraer datos de la tabla
    const table = doc.querySelector("table");
    if (!table) {
      throw new Error("Table not found in HTML");
    }

    const rows = Array.from(table.querySelectorAll("tr"));
    let peakPowerData = rows.slice(1).map(row => {
      const cells = Array.from(row.querySelectorAll("td"));
      const fecha = cells[0]?.textContent?.trim();
      const hora = cells[1]?.textContent?.trim();
      const programado = parseFloat(cells[2]?.textContent?.trim().replace(",", ".") || "0");
      const ejecutado = parseFloat(cells[3]?.textContent?.trim().replace(",", ".") || "0");

      // Verificar si la hora está entre las 18:00 y 23:00
      const horaNum = parseInt(hora.split(":")[0]);
      const isPeakHour = horaNum >= 18 && horaNum <= 23;

      return {
        fecha,
        hora,
        programado: isPeakHour ? programado : null,
        ejecutado: isPeakHour ? ejecutado : null,
        isPeakHour,
      };
    });

    // Agrupar por fecha y obtener máximos
    const dailyPeaks = peakPowerData.reduce((acc, curr) => {
      if (!curr.isPeakHour) return acc;
      
      if (!acc[curr.fecha]) {
        acc[curr.fecha] = {
          date: curr.fecha,
          max_programado: curr.programado,
          max_ejecutado: curr.ejecutado,
        };
      } else {
        if (curr.programado > acc[curr.fecha].max_programado) {
          acc[curr.fecha].max_programado = curr.programado;
        }
        if (curr.ejecutado > acc[curr.fecha].max_ejecutado) {
          acc[curr.fecha].max_ejecutado = curr.ejecutado;
        }
      }
      return acc;
    }, {});

    const result = Object.values(dailyPeaks);

    return new Response(JSON.stringify(result), {
      headers: corsHeaders,
      status: 200,
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({
      error: error.message,
      timestamp: new Date().toISOString(),
    }), {
      headers: corsHeaders,
      status: 500,
    });
  }
});
