
// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function getDefaultDates() {
  const currentDate = new Date();
  const startDate = new Date(currentDate);
  startDate.setDate(currentDate.getDate() - 3);
  const endDate = new Date(currentDate);
  endDate.setDate(currentDate.getDate() - 1);

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
}

serve(async (req) => {
  console.log('Iniciando función get-coes-historical');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    // Obtener fechas del request o usar las predeterminadas
    let { startDate, endDate } = await req.json().catch(() => ({}));
    if (!startDate || !endDate) {
      const defaultDates = getDefaultDates();
      startDate = startDate || defaultDates.startDate;
      endDate = endDate || defaultDates.endDate;
    }
    console.log('Fechas a usar:', { startDate, endDate });

    // Primera petición para obtener cookies y token
    console.log('Obteniendo página inicial...');
    const initialResponse = await fetch('https://www.coes.org.pe/Portal/portalinformacion/demanda', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3'
      }
    });

    if (!initialResponse.ok) {
      throw new Error(`Error al acceder a la página inicial: ${initialResponse.status}`);
    }

    const cookies = initialResponse.headers.get('set-cookie');
    const htmlContent = await initialResponse.text();
    console.log('Cookies obtenidas:', cookies);

    // Extraer el token de verificación si existe
    const tokenMatch = htmlContent.match(/<input[^>]*name="__RequestVerificationToken"[^>]*value="([^"]*)"[^>]*>/);
    const verificationToken = tokenMatch ? tokenMatch[1] : '';
    console.log('Token de verificación encontrado:', verificationToken ? 'Sí' : 'No');

    // Simular envío del formulario
    console.log('Enviando formulario de consulta...');
    const formData = new FormData();
    formData.append('txtFechaInicial', startDate);
    formData.append('txtFechaFinal', endDate);
    if (verificationToken) {
      formData.append('__RequestVerificationToken', verificationToken);
    }

    const searchResponse = await fetch('https://www.coes.org.pe/Portal/portalinformacion/demanda', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
        'Cookie': cookies || '',
        'Origin': 'https://www.coes.org.pe',
        'Referer': 'https://www.coes.org.pe/Portal/portalinformacion/demanda'
      },
      body: formData
    });

    if (!searchResponse.ok) {
      throw new Error(`Error al enviar formulario: ${searchResponse.status}`);
    }

    // Obtener datos exportados
    console.log('Solicitando exportación de datos...');
    const exportResponse = await fetch('https://www.coes.org.pe/Portal/portalinformacion/demanda/exportardemandamaximadiaria', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
        'Cookie': cookies || '',
        'Origin': 'https://www.coes.org.pe',
        'Referer': 'https://www.coes.org.pe/Portal/portalinformacion/demanda'
      },
      body: formData
    });

    if (!exportResponse.ok) {
      throw new Error(`Error al exportar datos: ${exportResponse.status}`);
    }

    const exportData = await exportResponse.text();
    console.log('Datos exportados recibidos:', exportData.substring(0, 500));

    // Procesar los datos exportados (asumiendo formato CSV o similar)
    const lines = exportData.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    const rawData = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index] || '';
        return obj;
      }, {} as any);
    });

    console.log('Datos procesados:', rawData);

    // Formatear los datos para Supabase
    const formattedData = rawData.map(row => ({
      fecha: row.Fecha || row.fecha,
      reprogramacion_diaria: parseFloat(row['Reprogramación Diaria'] || row.reprogramacionDiaria || '0'),
      ejecutado: parseFloat(row.Ejecutado || row.ejecutado || '0'),
      created_at: new Date().toISOString()
    }));

    if (formattedData.length === 0) {
      throw new Error('No se encontraron datos para procesar');
    }

    // Guardar en Supabase
    console.log('Conectando con Supabase...');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Variables de entorno de Supabase no configuradas');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Insertando datos en Supabase...');
    const { error: insertError } = await supabase
      .from('coes_historical')
      .upsert(formattedData);

    if (insertError) {
      console.error('Error al insertar en Supabase:', insertError);
      throw new Error(`Error al insertar datos: ${insertError.message}`);
    }

    console.log('Operación completada con éxito');
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Datos históricos obtenidos y guardados correctamente',
        count: formattedData.length,
        data: formattedData
      }),
      { 
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error en get-coes-historical:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Error al obtener datos históricos',
        details: error.message,
        stack: error.stack
      }),
      { 
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        },
        status: 500 
      }
    );
  }
});
