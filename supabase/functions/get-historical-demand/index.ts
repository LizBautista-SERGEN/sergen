
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
      startDate = new Date(body.startDate + 'T00:00:00');
      endDate = new Date(body.endDate + 'T23:59:59');

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

    // Esperar antes de la siguiente petición
    await new Promise(resolve => setTimeout(resolve, 2000));

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

    // Esperar antes de descargar el Excel
    await new Promise(resolve => setTimeout(resolve, 2000));

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

    const arrayBuffer = await excelResponse.arrayBuffer();
    console.log('Tamaño del archivo Excel:', arrayBuffer.byteLength);

    if (arrayBuffer.byteLength === 0) {
      throw new Error('El archivo Excel descargado está vacío');
    }

    // Paso 4: Procesar el archivo Excel
    const workbook = read(new Uint8Array(arrayBuffer), { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = utils.sheet_to_json(worksheet, { raw: false });

    // Procesar los datos del Excel
    const processedData = jsonData.map((row: any) => {
      try {
        // Verificar si tenemos las columnas necesarias
        if (!row['Fecha'] || !row['Hora']) {
          console.warn('Fila sin fecha u hora:', row);
          return null;
        }

        const fecha = row['Fecha'];
        const hora = row['Hora'];
        const ejecutado = row['Ejecutado'] ? parseFloat(row['Ejecutado'].replace(',', '')) : null;
        const programado = row['Pronóstico'] ? parseFloat(row['Pronóstico'].replace(',', '')) : null;

        return {
          fecha: fecha,
          hora: hora,
          programado: programado,
          ejecutado: ejecutado
        };
      } catch (error) {
        console.warn('Error procesando fila:', error);
        return null;
      }
    }).filter(item => item !== null);

    console.log(`Datos procesados: ${processedData.length} registros`);

    if (processedData.length === 0) {
      throw new Error('No se encontraron datos válidos en el archivo Excel');
    }

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
