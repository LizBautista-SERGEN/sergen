
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

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Fechas inválidas proporcionadas');
      }
    } catch (error) {
      console.error('Error parsing dates:', error);
      throw new Error('Error al procesar las fechas: ' + error.message);
    }

    const formatDateForForm = (date: Date) => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    console.log('Consultando datos para el rango:', formatDateForForm(startDate), 'hasta', formatDateForForm(endDate));

    // Paso 1: Obtener cookies de la sesión inicial
    const baseUrl = 'https://www.coes.org.pe/Portal/portalinformacion/demanda';
    const initialResponse = await fetch(baseUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!initialResponse.ok) {
      throw new Error(`Error en la conexión inicial: ${initialResponse.status}`);
    }

    const cookies = initialResponse.headers.get('set-cookie') || '';

    // Paso 2: Realizar la búsqueda con las fechas
    const searchFormData = new URLSearchParams();
    searchFormData.append('txtFechaInicio', formatDateForForm(startDate));
    searchFormData.append('txtFechaFin', formatDateForForm(endDate));

    const searchResponse = await fetch(`${baseUrl}/BusquedaProTiempoReal`, {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookies,
      },
      body: searchFormData.toString(),
    });

    if (!searchResponse.ok) {
      throw new Error(`Error en la búsqueda: ${searchResponse.status}`);
    }

    // Paso 3: Descargar el archivo Excel
    const excelResponse = await fetch(`${baseUrl}/ExportarPronosticoTiempoReal`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Cookie': cookies,
      },
    });

    if (!excelResponse.ok) {
      throw new Error(`Error al descargar Excel: ${excelResponse.status}`);
    }

    // Paso 4: Procesar el archivo Excel
    const arrayBuffer = await excelResponse.arrayBuffer();
    const workbook = read(new Uint8Array(arrayBuffer), { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = utils.sheet_to_json(worksheet, { raw: false });

    // Procesar los datos del Excel
    const processedData = jsonData.map((row: any) => {
      try {
        const fechaStr = row['Fecha'] || '';
        const horaStr = row['Hora'] || '';

        if (!fechaStr || !horaStr) return null;

        const [dia, mes, anio] = fechaStr.split('/').map(n => parseInt(n));
        const [hora, minuto] = horaStr.split(':').map(n => parseInt(n));

        if (isNaN(dia) || isNaN(mes) || isNaN(anio) || isNaN(hora) || isNaN(minuto)) {
          return null;
        }

        const fechaCompleta = new Date(anio, mes - 1, dia, hora, minuto);

        if (isNaN(fechaCompleta.getTime())) {
          return null;
        }

        return {
          fecha: fechaCompleta.toISOString(),
          hora: horaStr,
          programado: parseFloat(row['Pronóstico'] || '0'),
          ejecutado: parseFloat(row['Ejecutado'] || '0'),
        };
      } catch (error) {
        console.warn('Error procesando fila:', error);
        return null;
      }
    }).filter(item => item !== null);

    console.log(`Datos procesados: ${processedData.length} registros`);

    return new Response(JSON.stringify(processedData), {
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
