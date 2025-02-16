
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

interface RequestBody {
  startDate?: string;
  endDate?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    let body: RequestBody = {};
    if (req.method === 'POST') {
      body = await req.json();
    }

    const today = new Date();
    const defaultStartDate = new Date(today);
    defaultStartDate.setDate(today.getDate() - 2);
    const defaultEndDate = new Date(today);
    defaultEndDate.setDate(today.getDate() - 1);

    const startDate = body.startDate ? new Date(body.startDate) : defaultStartDate;
    const endDate = body.endDate ? new Date(body.endDate) : defaultEndDate;

    // Formatear fechas para la URL
    const formatDateForUrl = (date: Date) => {
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };

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
    const data = rows.slice(1).map(row => {
      const cells = Array.from(row.querySelectorAll("td"));
      return {
        fecha: cells[0]?.textContent?.trim(),
        hora: cells[1]?.textContent?.trim(),
        programado: parseFloat(cells[2]?.textContent?.trim().replace(",", ".") || "0"),
        ejecutado: parseFloat(cells[3]?.textContent?.trim().replace(",", ".") || "0"),
      };
    });

    // Filtrar por rango de fechas
    const filteredData = data.filter(item => {
      const itemDate = new Date(item.fecha);
      return itemDate >= startDate && itemDate <= endDate;
    });

    return new Response(JSON.stringify(filteredData), {
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
