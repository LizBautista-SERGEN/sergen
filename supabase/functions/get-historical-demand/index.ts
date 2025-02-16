
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

// Función temporal para generar datos históricos de prueba
const generateMockHistoricalData = (startDate: Date, endDate: Date) => {
  const data = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    for (let hour = 0; hour < 24; hour++) {
      const date = new Date(currentDate);
      date.setHours(hour);
      
      data.push({
        fecha: `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${hour.toString().padStart(2, '0')}:00`,
        programado: Math.round(4500 + Math.random() * 1000),
        ejecutado: Math.round(4500 + Math.random() * 1000)
      });
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return data;
};

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

    if (!body.startDate || !body.endDate) {
      throw new Error('Se requieren las fechas de inicio y fin');
    }

    // Validación y parsing de fechas
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Fechas inválidas proporcionadas');
    }

    console.log('Generando datos históricos de prueba...');
    const mockData = generateMockHistoricalData(startDate, endDate);
    console.log('Datos generados:', mockData.length, 'registros');

    return new Response(JSON.stringify(mockData), {
      headers: { ...corsHeaders },
      status: 200,
    });

  } catch (error) {
    console.error('Error detallado:', error);
    return new Response(JSON.stringify({
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: corsHeaders,
      status: 500,
    });
  }
});
