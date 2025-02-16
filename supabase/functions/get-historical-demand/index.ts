
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

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

    // Validación y parsing de fechas
    let startDate: Date;
    let endDate: Date;

    try {
      startDate = body.startDate ? new Date(body.startDate + 'T00:00:00') : defaultStartDate;
      endDate = body.endDate ? new Date(body.endDate + 'T23:59:59') : defaultEndDate;

      // Verificar si las fechas son válidas
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Fechas inválidas proporcionadas');
      }
    } catch (error) {
      console.error('Error parsing dates:', error);
      throw new Error('Error al procesar las fechas: ' + error.message);
    }

    const formatDateForDisplay = (date: Date) => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    console.log('Consultando datos para el rango:', formatDateForDisplay(startDate), 'hasta', formatDateForDisplay(endDate));

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
      try {
        const cells = Array.from(row.querySelectorAll("td"));
        const fechaStr = cells[0]?.textContent?.trim() || '';
        const horaStr = cells[1]?.textContent?.trim() || '';
        
        if (!fechaStr || !horaStr) {
          console.warn('Fila sin fecha u hora:', { fechaStr, horaStr });
          return null;
        }

        // Parsear la fecha con validación
        const [dia, mes, anio] = fechaStr.split('/').map(n => parseInt(n));
        const [hora, minuto] = horaStr.split(':').map(n => parseInt(n));

        if (isNaN(dia) || isNaN(mes) || isNaN(anio) || isNaN(hora) || isNaN(minuto)) {
          console.warn('Valores de fecha/hora inválidos:', { dia, mes, anio, hora, minuto });
          return null;
        }

        const fechaCompleta = new Date(anio, mes - 1, dia, hora, minuto);

        if (isNaN(fechaCompleta.getTime())) {
          console.warn('Fecha completa inválida:', fechaCompleta);
          return null;
        }

        return {
          fecha: fechaCompleta.toISOString(),
          hora: horaStr,
          programado: parseFloat(cells[2]?.textContent?.trim().replace(",", ".") || "0"),
          ejecutado: parseFloat(cells[3]?.textContent?.trim().replace(",", ".") || "0"),
        };
      } catch (error) {
        console.warn('Error procesando fila:', error);
        return null;
      }
    }).filter(item => item !== null);

    // Filtrar por rango de fechas
    const filteredData = data.filter(item => {
      if (!item) return false;
      const itemDate = new Date(item.fecha);
      return itemDate >= startDate && itemDate <= endDate;
    });

    console.log(`Datos filtrados: ${filteredData.length} registros`);

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
