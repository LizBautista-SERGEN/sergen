
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

    // Paso 1: Obtener la página inicial y el token CSRF
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
    const cookies = initialResponse.headers.get('set-cookie') || '';
    const tokenMatch = initialHtml.match(/<input[^>]*name="__RequestVerificationToken"[^>]*value="([^"]*)"[^>]*>/);
    const csrfToken = tokenMatch ? tokenMatch[1] : '';

    if (!csrfToken) {
      throw new Error('No se pudo obtener el token CSRF');
    }

    console.log('Token CSRF obtenido:', csrfToken);
    
    // Paso 2: Enviar el formulario (simular clic en btnConsulta)
    const formData = new URLSearchParams({
      'txtFechaInicial': startDateStr,
      'txtFechaFinal': endDateStr,
      '__RequestVerificationToken': csrfToken
    });

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
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: formData.toString()
    });

    if (!consultaResponse.ok) {
      throw new Error(`Error en la consulta: ${consultaResponse.status}`);
    }

    await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar a que la página procese la consulta

    // Paso 3: Descargar el Excel (simular clic en btnExportar)
    const excelResponse = await fetch(`${baseUrl}/ExportarDemanda`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/vnd.ms-excel',
        'Cookie': cookies,
        'Referer': baseUrl
      }
    });

    if (!excelResponse.ok) {
      throw new Error(`Error al descargar Excel: ${excelResponse.status}`);
    }

    const arrayBuffer = await excelResponse.arrayBuffer();
    console.log('Tamaño del archivo Excel:', arrayBuffer.byteLength, 'bytes');

    // Procesar el Excel
    const workbook = read(new Uint8Array(arrayBuffer), { type: 'array' });
    const firstSheet = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheet];

    // Obtener todas las filas del Excel
    const rawData = utils.sheet_to_json(worksheet, { 
      header: 1,
      raw: false,
      blankrows: false
    });

    console.log('Datos crudos del Excel:', rawData.slice(0, 5));

    // Encontrar el índice donde comienzan los datos reales
    let dataStartIndex = 0;
    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i] as any[];
      if (row && row.length >= 4 && row[0] === 'Fecha' && row[1] === 'Hora') {
        dataStartIndex = i;
        break;
      }
    }

    // Transformar solo las filas con datos reales
    const transformedData = rawData.slice(dataStartIndex + 1)
      .filter((row: any[]) => row && row.length >= 4 && row[0] && row[1])
      .map((row: any[]) => ({
        fecha: row[0],
        hora: row[1],
        programado: parseFloat(row[2]?.toString().replace(',', '.')) || null,
        ejecutado: parseFloat(row[3]?.toString().replace(',', '.')) || null
      }));

    console.log('Datos procesados:', transformedData.slice(0, 3));

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
