
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function formatDateForCOES(dateStr: string) {
  // Convertir YYYY-MM-DD a DD/MM/YYYY
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const controller = new AbortController();
      const timeout = (i + 1) * 60000; // Incrementar timeout en cada intento: 60s, 120s, 180s
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      console.log(`Intento ${i + 1} de ${maxRetries} con timeout de ${timeout}ms`);

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    } catch (error) {
      console.error(`Error en intento ${i + 1}:`, error);
      lastError = error;
      if (error.name !== 'AbortError') {
        break; // Si no es timeout, no reintentar
      }
      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  throw lastError;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lectcodi, tipoempresa, empresas, fechaInicio, fechaFin } = await req.json();

    // Validar parámetros
    if (!lectcodi || !tipoempresa || !empresas || !fechaInicio || !fechaFin) {
      console.error('Parámetros faltantes:', { lectcodi, tipoempresa, empresas, fechaInicio, fechaFin });
      throw new Error('Todos los parámetros son requeridos');
    }

    // Formatear fechas para la API del COES
    const fechaInicioFormateada = formatDateForCOES(fechaInicio);
    const fechaFinFormateada = formatDateForCOES(fechaFin);

    // Construir la URL de la API del COES
    const coesUrl = `https://api.coes.org.pe/medicionessiem/api/demanda`;

    console.log('Consultando API COES:', coesUrl, {
      lectcodi,
      tipoempresa,
      empresas,
      fechaInicio: fechaInicioFormateada,
      fechaFin: fechaFinFormateada
    });

    const response = await fetchWithRetry(coesUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Content-Type': 'application/json',
        'Origin': 'https://api.coes.org.pe',
        'Referer': 'https://api.coes.org.pe/',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'sec-ch-ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin'
      },
      body: JSON.stringify({
        lectcodi,
        tipoempresa,
        empresas,
        fechaInicio: fechaInicioFormateada,
        fechaFin: fechaFinFormateada
      })
    });
    
    if (!response.ok) {
      const responseText = await response.text();
      console.error('Error en respuesta COES:', {
        status: response.status,
        statusText: response.statusText,
        url: coesUrl,
        responseBody: responseText
      });
      throw new Error(`Error en respuesta COES: ${response.status} ${response.statusText} - ${responseText}`);
    }

    const data = await response.json();
    console.log('Respuesta exitosa de COES:', data);

    if (!Array.isArray(data)) {
      console.error('Respuesta inválida de COES:', data);
      throw new Error('Formato de respuesta inválido del COES');
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error detallado:', error);
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
