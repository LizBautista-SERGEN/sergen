
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

    // Paso 1: Obtener la página inicial para obtener cookies y token
    const baseUrl = 'https://www.coes.org.pe/Portal/portalinformacion/demanda';
    const initialResponse = await fetch(baseUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    });

    if (!initialResponse.ok) {
      throw new Error(`Error en la conexión inicial: ${initialResponse.status}`);
    }

    const initialHtml = await initialResponse.text();
    const cookies = initialResponse.headers.get('set-cookie') || '';
    
    // Extraer el token CSRF del HTML
    const tokenMatch = initialHtml.match(/<input[^>]*name="__RequestVerificationToken"[^>]*value="([^"]*)"[^>]*>/);
    const csrfToken = tokenMatch ? tokenMatch[1] : '';
    
    console.log('Cookies obtenidas:', cookies ? 'Sí' : 'No');
    console.log('Token CSRF obtenido:', csrfToken ? 'Sí' : 'No');

    // Esperar 5 segundos antes de la siguiente petición (similar al time.sleep(5) en Python)
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Paso 2: Realizar la búsqueda con las fechas
    const formData = new URLSearchParams();
    formData.append('txtFechaInicial', startDateStr); // Cambio de nombre del campo a txtFechaInicial
    formData.append('txtFechaFinal', endDateStr);     // Cambio de nombre del campo a txtFechaFinal
    if (csrfToken) {
      formData.append('__RequestVerificationToken', csrfToken);
    }

    console.log('Enviando formulario con datos:', formData.toString());

    const searchUrl = `${baseUrl}/Consultar`; // Cambio a la URL correcta del botón Consultar
    const searchResponse = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookies,
        'Accept': '*/*', // Cambiado para aceptar cualquier tipo de respuesta
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Origin': 'https://www.coes.org.pe',
        'Referer': baseUrl,
        'X-Requested-With': 'XMLHttpRequest', // Añadido para indicar que es una petición AJAX
      },
      body: formData.toString(),
    });

    if (!searchResponse.ok) {
      throw new Error(`Error en la búsqueda: ${searchResponse.status}`);
    }

    // Esperar 10 segundos antes de exportar (similar al time.sleep(5) en Python)
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Paso 3: Descargar el Excel usando la URL correcta del botón Exportar
    const exportUrl = `${baseUrl}/Exportar`;
    const exportResponse = await fetch(exportUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/vnd.ms-excel',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Cookie': cookies,
        'Referer': baseUrl,
      },
    });

    if (!exportResponse.ok) {
      const errorText = await exportResponse.text();
      console.error('Error response from export:', errorText);
      throw new Error(`Error al exportar: ${exportResponse.status}`);
    }

    const arrayBuffer = await exportResponse.arrayBuffer();
    console.log('Tamaño del archivo Excel:', arrayBuffer.byteLength, 'bytes');

    if (arrayBuffer.byteLength === 0) {
      throw new Error('El archivo Excel descargado está vacío');
    }

    // Paso 4: Procesar el archivo Excel
    const workbook = read(new Uint8Array(arrayBuffer), { type: 'array' });
    
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error('El archivo Excel no contiene hojas');
    }

    console.log('Hojas encontradas:', workbook.SheetNames);

    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = utils.sheet_to_json(worksheet, {
      raw: false,
      defval: null,
      header: 1,
    });

    console.log('Primeras filas del Excel:', JSON.stringify(jsonData.slice(0, 3)));

    // Encontrar la fila de encabezados
    const headerRowIndex = jsonData.findIndex((row: any[]) => 
      Array.isArray(row) && row.some(cell => 
        cell && typeof cell === 'string' && (
          cell.includes('Fecha') || 
          cell.includes('Ejecutado') ||
          cell.includes('Prog. Diaria') ||
          cell.includes('Prog. Semanal')
        )
      )
    );

    if (headerRowIndex === -1) {
      throw new Error('No se encontró la fila de encabezados en el Excel');
    }

    const headers = jsonData[headerRowIndex];
    const data = jsonData.slice(headerRowIndex + 1);

    console.log('Encabezados encontrados:', headers);

    const processedData = data
      .filter((row: any[]) => Array.isArray(row) && row.length >= 2)
      .map((row: any[]) => {
        try {
          const fechaIndex = headers.findIndex((h: string) => h && h.includes('Fecha'));
          const ejecutadoIndex = headers.findIndex((h: string) => h && h.includes('Ejecutado'));
          const progDiariaIndex = headers.findIndex((h: string) => h && h.includes('Prog. Diaria'));
          const progSemanalIndex = headers.findIndex((h: string) => h && h.includes('Prog. Semanal'));

          const fecha = row[fechaIndex];

          if (!fecha) return null;

          const parsearNumero = (valor: any) => {
            if (!valor) return null;
            const strVal = String(valor).replace(/\s/g, '').replace(',', '.');
            const num = parseFloat(strVal);
            return !isNaN(num) ? num : null;
          };

          const ejecutado = ejecutadoIndex !== -1 ? parsearNumero(row[ejecutadoIndex]) : null;
          const programado = progDiariaIndex !== -1 ? parsearNumero(row[progDiariaIndex]) : null;
          const progsemanal = progSemanalIndex !== -1 ? parsearNumero(row[progSemanalIndex]) : null;

          console.log('Procesando fila:', {
            fecha,
            ejecutado,
            programado,
            progsemanal
          });

          return {
            fecha,
            ejecutado,
            programado,
            progsemanal,
          };
        } catch (error) {
          console.error('Error procesando fila:', error);
          return null;
        }
      })
      .filter(item => item !== null);

    console.log(`Datos procesados: ${processedData.length} registros`);
    console.log('Muestra de datos procesados:', processedData.slice(0, 3));

    if (processedData.length === 0) {
      throw new Error('No se encontraron datos válidos en el Excel');
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
      details: error.stack
    }), {
      headers: corsHeaders,
      status: 500,
    });
  }
});
