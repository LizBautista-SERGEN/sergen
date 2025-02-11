
import { serve } from 'https://deno.fresh.dev/std@v9.6.1/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lectcodi, tipoempresa, empresas, fechaInicio, fechaFin } = await req.json();

    // Construir la URL de la API del COES
    const coesUrl = `https://appserver.coes.org.pe/waMediciones/api/Demanda?lectcodi=${lectcodi}&tipoempresa=${tipoempresa}&empresas=${empresas}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;

    console.log('Consultando API COES:', coesUrl);

    const response = await fetch(coesUrl);
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error al obtener datos del COES:', error);
    return new Response(
      JSON.stringify({ error: 'Error al obtener datos del COES' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
