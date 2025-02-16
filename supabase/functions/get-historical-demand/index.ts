
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { read, utils } from "https://esm.sh/xlsx@0.18.5";

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

    if (!body.startDate || !body.endDate) {
      throw new Error('Se requieren las fechas de inicio y fin');
    }

    // Validación y parsing de fechas
    let startDate: Date;
    let endDate: Date;

    try {
      startDate = new Date(body.startDate);
      endDate = new Date(body.endDate);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Fechas inválidas proporcionadas');
      }
    } catch (error) {
      console.error('Error parsing dates:', error);
      throw new Error('Error al procesar las fechas: ' + error.message);
    }

    const formatDateForForm = (date: Date) => {
      return [
        date.getDate().toString().padStart(2, '0'),
        (date.getMonth() + 1).toString().padStart(2, '0'),
        date.getFullYear()
      ].join('/');
    };

    const startDateStr = formatDateForForm(startDate);
    const endDateStr = formatDateForForm(endDate);
    console.log('Consultando datos para el rango:', startDateStr, 'hasta', endDateStr);

    // Paso 1: Obtener la página inicial para conseguir el token CSRF y cookies
    const baseUrl = 'https://www.coes.org.pe/Portal/portalinformacion/demanda';
    const initialResponse = await fetch(baseUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      },
    });

    if (!initialResponse.ok) {
      throw new Error(`Error en la conexión inicial: ${initialResponse.status}`);
    }

    const initialHtml = await initialResponse.text();
    console.log('HTML inicial obtenido:', initialHtml.substring(0, 500)); // Log primeros 500 caracteres

    // Extraer el token CSRF y cookies
    const cookies = initialResponse.headers.get('set-cookie') || '';
    const tokenMatch = initialHtml.match(/<input[^>]*name="__RequestVerificationToken"[^>]*value="([^"]*)"[^>]*>/);
    const csrfToken = tokenMatch ? tokenMatch[1] : '';
    
    console.log('Cookies obtenidas:', cookies);
    console.log('Token CSRF obtenido:', csrfToken);

    // Paso 2: Simular clic en botón Consultar (btnConsulta)
    const consultaResponse = await fetch(`${baseUrl}/BusquedaDemanda`, {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookies,
        'Accept': '*/*',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Origin': 'https://www.coes.org.pe',
        'Referer': baseUrl,
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: new URLSearchParams({
        'txtFechaInicial': startDateStr,
        'txtFechaFinal': endDateStr,
        '__RequestVerificationToken': csrfToken,
      }).toString(),
    });

    if (!consultaResponse.ok) {
      throw new Error(`Error en la consulta: ${consultaResponse.status}`);
    }

    console.log('Respuesta de consulta:', await consultaResponse.text());

    // Paso 3: Simular clic en botón Exportar (btnExportar)
    const excelResponse = await fetch(`${baseUrl}/ExportarDemanda`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/vnd.ms-excel',
        'Cookie': cookies,
        'Referer': baseUrl,
      },
    });

    if (!excelResponse.ok) {
      console.error('Error status:', excelResponse.status);
      console.error('Error headers:', Object.fromEntries(excelResponse.headers.entries()));
      throw new Error(`Error al descargar Excel: ${excelResponse.status}`);
    }

    const contentType = excelResponse.headers.get('content-type');
    console.log('Tipo de contenido del Excel:', contentType);

    const arrayBuffer = await excelResponse.arrayBuffer();
    console.log('Tamaño del archivo descargado:', arrayBuffer.byteLength, 'bytes');

    if (arrayBuffer.byteLength === 0) {
      throw new Error('Archivo Excel vacío');
    }

    // Procesar el Excel
    const workbook = read(new Uint8Array(arrayBuffer), { type: 'array' });
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error('Excel sin hojas');
    }

    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = utils.sheet_to_json(worksheet, { 
      header: 1,
      raw: false,
      dateNF: 'dd/mm/yyyy'
    });

    console.log('Estructura del Excel:', jsonData.slice(0, 3));

    // Transformar los datos al formato esperado
    const transformedData = jsonData.slice(1).map((row: any) => ({
      fecha: row[0],
      hora: row[1],
      programado: parseFloat(row[2]) || null,
      ejecutado: parseFloat(row[3]) || null
    })).filter(item => item.fecha && item.hora);

    console.log('Datos transformados:', transformedData.slice(0, 3));

    return new Response(JSON.stringify(transformedData), {
      headers: { ...corsHeaders },
      status: 200,
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: corsHeaders,
      status: 500,
    });
  }
});
