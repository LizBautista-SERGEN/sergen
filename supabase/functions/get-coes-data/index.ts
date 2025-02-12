
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
    const coesUrl = `https://appserver.coes.org.pe/waMediciones/api/Demanda`;

    console.log('Consultando API COES:', coesUrl, {
      lectcodi,
      tipoempresa,
      empresas,
      fechaInicio: fechaInicioFormateada,
      fechaFin: fechaFinFormateada
    });

    const response = await fetch(coesUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
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
