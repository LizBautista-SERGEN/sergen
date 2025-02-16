
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Función temporal para generar datos de prueba
const generateMockData = () => {
  const data = [];
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < 24; i++) {
    const date = new Date(startDate);
    date.setHours(i);
    
    data.push({
      Fecha: date.toISOString(),
      "Reprogramación Diaria": Math.round(4500 + Math.random() * 1000),
      "Pronóstico": Math.round(4500 + Math.random() * 1000),
      "Rango Mínimo": Math.round(4200 + Math.random() * 500),
      "Rango Máximo": Math.round(5000 + Math.random() * 500),
      "Ejecutado": Math.round(4500 + Math.random() * 1000)
    });
  }
  
  return data;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    console.log('Iniciando generación de datos de prueba...');
    
    // Por ahora, generamos datos de prueba
    const mockData = generateMockData();
    
    console.log('Datos generados exitosamente:', mockData.length, 'registros');

    return new Response(JSON.stringify(mockData), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 200,
    });

  } catch (error) {
    console.error('Error en el proceso:', error);
    return new Response(JSON.stringify({
      error: 'Error al obtener datos',
      details: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 500,
    });
  }
});
