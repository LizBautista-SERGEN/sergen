
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
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
      },
    });

    if (!initialResponse.ok) {
      throw new Error(`Error en la conexión inicial: ${initialResponse.status}`);
    }

    const cookies = initialResponse.headers.get('set-cookie') || '';
    console.log('Cookies obtenidas:', cookies ? 'Sí' : 'No');

    // Esperar antes de la siguiente petición
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Paso 2: Realizar la búsqueda con las fechas
    const searchFormData = new URLSearchParams();
    searchFormData.append('txtFechaInicio', formatDateForForm(startDate));
    searchFormData.append('txtFechaFin', formatDateForForm(endDate));
    searchFormData.append('__RequestVerificationToken', ''); // Token CSRF si es necesario

    console.log('Enviando búsqueda con fechas:', searchFormData.toString());

    const searchUrl = `${baseUrl}/Buscar`;
    console.log('URL de búsqueda:', searchUrl);

    const searchResponse = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookies,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
        'Origin': 'https://www.coes.org.pe',
        'Referer': baseUrl,
      },
      body: searchFormData.toString(),
    });

    if (!searchResponse.ok) {
      throw new Error(`Error en la búsqueda: ${searchResponse.status}`);
    }

    const searchResponseText = await searchResponse.text();
    console.log('Respuesta de búsqueda recibida, longitud:', searchResponseText.length);

    // Esperar antes de descargar el Excel
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Paso 3: Descargar el archivo Excel
    const exportUrl = `${baseUrl}/Exportar`;
    console.log('URL de exportación:', exportUrl);

    const excelResponse = await fetch(exportUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Cookie': cookies,
        'Accept': 'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
        'Referer': baseUrl,
      },
    });

    if (!excelResponse.ok) {
      const responseText = await excelResponse.text();
      console.error('Respuesta de error al descargar Excel:', responseText);
      throw new Error(`Error al descargar Excel: ${excelResponse.status}`);
    }

    const arrayBuffer = await excelResponse.arrayBuffer();
    console.log('Tamaño del archivo Excel:', arrayBuffer.byteLength, 'bytes');

    if (arrayBuffer.byteLength === 0) {
      throw new Error('El archivo Excel descargado está vacío');
    }

    // Paso 4: Procesar el archivo Excel
    const workbook = read(new Uint8Array(arrayBuffer), { type: 'array' });
    
    console.log('Nombres de hojas disponibles:', workbook.SheetNames);
    
    if (workbook.SheetNames.length === 0) {
      throw new Error('El archivo Excel no contiene hojas');
    }

    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = utils.sheet_to_json(worksheet, { 
      raw: false,
      defval: null,
      header: 1 
    });

    console.log('Primeras filas del Excel:', JSON.stringify(jsonData.slice(0, 3)));

    // Encontrar la fila del encabezado
    const headerRowIndex = jsonData.findIndex((row: any[]) => 
      row.some((cell: any) => 
        cell && (
          String(cell).includes('Fecha') || 
          String(cell).includes('Hora') ||
          String(cell).includes('Pronóstico') ||
          String(cell).includes('Ejecutado')
        )
      )
    );

    if (headerRowIndex === -1) {
      throw new Error('No se encontró la fila de encabezados en el Excel');
    }

    console.log('Índice de fila de encabezados:', headerRowIndex);

    // Convertir a formato de objetos usando los encabezados encontrados
    const headers = jsonData[headerRowIndex];
    const data = jsonData.slice(headerRowIndex + 1);

    console.log('Encabezados encontrados:', headers);

    const processedData = data.map((row: any[], index: number) => {
      try {
        if (!Array.isArray(row) || row.length < 2) {
          console.warn('Fila inválida:', index + headerRowIndex + 1, row);
          return null;
        }

        // Mapear columnas basado en los encabezados
        const fechaIndex = headers.findIndex((h: string) => h && h.includes('Fecha'));
        const horaIndex = headers.findIndex((h: string) => h && h.includes('Hora'));
        const programadoIndex = headers.findIndex((h: string) => h && (
          h.includes('Pronóstico') || 
          h.includes('Pronostico') || 
          h.includes('Programado')
        ));
        const ejecutadoIndex = headers.findIndex((h: string) => h && h.includes('Ejecutado'));

        if (fechaIndex === -1 || horaIndex === -1) {
          console.warn('No se encontraron columnas requeridas en fila:', index + headerRowIndex + 1);
          return null;
        }

        const fecha = row[fechaIndex];
        const hora = row[horaIndex];

        if (!fecha || !hora) {
          console.warn('Fila sin fecha u hora:', index + headerRowIndex + 1, row);
          return null;
        }

        // Parsear números
        const parsearNumero = (valor: any) => {
          if (!valor) return null;
          const strVal = String(valor).replace(/\s/g, '').replace(',', '.');
          const num = parseFloat(strVal);
          return !isNaN(num) ? num : null;
        };

        const programado = programadoIndex !== -1 ? parsearNumero(row[programadoIndex]) : null;
        const ejecutado = ejecutadoIndex !== -1 ? parsearNumero(row[ejecutadoIndex]) : null;

        return {
          fecha,
          hora,
          programado,
          ejecutado
        };
      } catch (error) {
        console.warn('Error procesando fila:', index + headerRowIndex + 1, error);
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
      details: error.stack
    }), {
      headers: corsHeaders,
      status: 500,
    });
  }
});
