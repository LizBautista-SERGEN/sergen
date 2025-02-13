
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { read, utils } from "https://esm.sh/xlsx@0.18.5";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.1.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

const parseNumber = (value: string | number): number => {
  try {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    const cleanValue = value.toString().replace(/\s/g, '').replace(',', '.');
    const number = parseFloat(cleanValue);
    return isNaN(number) ? 0 : number;
  } catch (error) {
    console.error('Error parseando número:', value, error);
    return 0;
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Obtener fecha actual en formato dd/mm/yyyy
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

    // Primero, simulamos una sesión web completa
    const mainPageUrl = 'https://www.coes.org.pe/Portal/portalinformacion/demanda';
    console.log('Visitando página principal:', mainPageUrl);
    
    const mainPageResponse = await fetch(mainPageUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (!mainPageResponse.ok) {
      throw new Error(`Error accediendo a la página principal: ${mainPageResponse.status}`);
    }

    const cookies = mainPageResponse.headers.get('set-cookie');
    console.log('Cookies iniciales:', cookies);

    // Esperamos un momento antes de hacer la siguiente petición
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Preparar los datos del formulario
    const formData = new URLSearchParams();
    formData.append('txtFechaInicio', formattedDate);
    formData.append('txtFechaFin', formattedDate);

    // Realizar la petición POST al endpoint de búsqueda
    const searchUrl = 'https://www.coes.org.pe/Portal/portalinformacion/BusquedaProTiempoReal';
    console.log('Enviando búsqueda con fecha:', formattedDate);

    const searchResponse = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': '*/*',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Origin': 'https://www.coes.org.pe',
        'Referer': mainPageUrl,
        'Cookie': cookies || '',
      },
      body: formData.toString()
    });

    if (!searchResponse.ok) {
      throw new Error(`Error en la búsqueda: ${searchResponse.status}`);
    }

    console.log('Búsqueda completada, esperando antes de descargar');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Hacemos la petición al endpoint de exportación
    const exportUrl = 'https://www.coes.org.pe/Portal/portalinformacion/ExportarPronosticoTiempoReal';
    console.log('Descargando archivo desde:', exportUrl);

    const exportResponse = await fetch(exportUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Referer': mainPageUrl,
        'Cookie': cookies || '',
      }
    });

    console.log('Estado de la respuesta:', exportResponse.status);
    console.log('Headers de la respuesta:', Object.fromEntries(exportResponse.headers.entries()));

    if (!exportResponse.ok) {
      const responseText = await exportResponse.text();
      console.error('Contenido de la respuesta de error:', responseText);
      throw new Error(`Error en la descarga: ${exportResponse.status} ${exportResponse.statusText}`);
    }

    const arrayBuffer = await exportResponse.arrayBuffer();
    console.log('Tamaño del archivo:', arrayBuffer.byteLength, 'bytes');

    if (arrayBuffer.byteLength === 0) {
      throw new Error('El archivo descargado está vacío');
    }

    try {
      console.log('Iniciando procesamiento del archivo Excel');
      
      // Verificar los primeros bytes del archivo para asegurarnos que es un Excel
      const firstBytes = new Uint8Array(arrayBuffer.slice(0, 4));
      console.log('Primeros bytes del archivo:', Array.from(firstBytes));
      
      // Leer el archivo Excel
      const workbook = read(new Uint8Array(arrayBuffer), { 
        type: 'array',
        cellDates: true,
        cellNF: false,
        cellText: false
      });

      console.log('Hojas encontradas:', workbook.SheetNames);

      if (!workbook.SheetNames.length) {
        throw new Error('El archivo Excel no contiene hojas');
      }

      // Obtener la primera hoja
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      console.log('Rango de la hoja:', worksheet['!ref']);
      
      // Convertir a JSON
      const jsonData = utils.sheet_to_json(worksheet, {
        raw: true,
        dateNF: 'yyyy-mm-dd HH:mm:ss',
        header: 1,
        blankrows: false
      });

      console.log('Filas encontradas:', jsonData.length);
      console.log('Estructura de las primeras filas:', jsonData.slice(0, 3));

      if (!Array.isArray(jsonData) || jsonData.length === 0) {
        throw new Error('No se encontraron datos en el archivo Excel');
      }

      // Encontrar la fila de encabezados
      const headerRow = jsonData.find((row: any[]) => 
        Array.isArray(row) && row.some((cell: any) => 
          typeof cell === 'string' && 
          (cell.toLowerCase().includes('fecha') || 
           cell.toLowerCase().includes('ejecutado'))
        )
      );

      if (!headerRow) {
        console.log('Contenido completo:', JSON.stringify(jsonData));
        throw new Error('No se encontró la fila de encabezados en el Excel');
      }

      const headerIndex = jsonData.indexOf(headerRow);
      const dataRows = jsonData.slice(headerIndex + 1);

      // Procesar los datos
      const processedData = dataRows
        .filter((row: any[]) => row && row.length >= 3)
        .map((row: any[]) => ({
          Fecha: row[0],
          Ejecutado: parseNumber(row[1]),
          "Prog. Diaria": parseNumber(row[2]),
          "Prog. Semanal": row.length > 3 ? parseNumber(row[3]) : 0
        }))
        .filter(data => data.Fecha && (data.Ejecutado > 0 || data["Prog. Diaria"] > 0));

      if (processedData.length === 0) {
        throw new Error('No se encontraron datos válidos en el archivo Excel');
      }

      console.log(`Datos procesados: ${processedData.length} registros`);
      console.log('Muestra de datos procesados:', JSON.stringify(processedData[0], null, 2));

      // Guardar datos en la base de datos
      for (const item of processedData) {
        const { error: insertError } = await supabase
          .from('coes_demand_data')
          .upsert({
            date: item.Fecha,
            executed_power: item.Ejecutado,
            daily_forecast: item["Prog. Diaria"],
            weekly_forecast: item["Prog. Semanal"],
            created_at: new Date()
          });

        if (insertError) {
          console.error('Error al insertar datos:', insertError);
        }
      }

      return new Response(JSON.stringify(processedData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });

    } catch (excelError) {
      console.error('Error procesando Excel:', excelError);
      throw new Error(`Error procesando archivo Excel: ${excelError.message}`);
    }

  } catch (error) {
    console.error('Error en el proceso:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Error al obtener datos del COES',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
