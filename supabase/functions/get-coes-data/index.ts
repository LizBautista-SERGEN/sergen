
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as XLSX from 'https://deno.land/x/xlsx@v0.0.2/mod.ts';
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
        'Pragma': 'no-cache',
        'sec-ch-ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1'
      },
      redirect: 'follow'
    });

    if (!mainPageResponse.ok) {
      throw new Error(`Error accediendo a la página principal: ${mainPageResponse.status}`);
    }

    const cookies = mainPageResponse.headers.get('set-cookie');
    console.log('Cookies obtenidas:', cookies);

    // Esperamos un momento antes de hacer la siguiente petición
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
        'Referer': mainPageUrl,
        'Cookie': cookies || '',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'sec-ch-ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin'
      },
      redirect: 'follow'
    });

    if (!exportResponse.ok) {
      throw new Error(`Error en la descarga: ${exportResponse.status} ${exportResponse.statusText}`);
    }

    const contentType = exportResponse.headers.get('content-type');
    console.log('Tipo de contenido recibido:', contentType);

    const arrayBuffer = await exportResponse.arrayBuffer();
    console.log('Tamaño del archivo:', arrayBuffer.byteLength, 'bytes');

    if (arrayBuffer.byteLength === 0) {
      throw new Error('El archivo descargado está vacío');
    }

    try {
      console.log('Iniciando procesamiento del archivo Excel');
      const workbook = XLSX.read(new Uint8Array(arrayBuffer), { 
        type: 'array',
        cellDates: true,
        dateNF: 'yyyy-mm-dd HH:mm:ss'
      });
      
      console.log('Hojas en el Excel:', workbook.SheetNames);

      if (workbook.SheetNames.length === 0) {
        throw new Error('El archivo Excel no contiene hojas');
      }

      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      if (!worksheet) {
        throw new Error('No se pudo acceder a la primera hoja del Excel');
      }

      console.log('Primera hoja:', workbook.SheetNames[0]);
      console.log('Rango de la hoja:', worksheet['!ref']);

      // Convertir a JSON con opciones específicas para manejar fechas
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        raw: true, // Cambiado a true para obtener valores sin formato
        dateNF: 'yyyy-mm-dd HH:mm:ss'
      });

      console.log('Filas encontradas:', jsonData.length);
      console.log('Primeras filas:', JSON.stringify(jsonData.slice(0, 3), null, 2));

      if (!Array.isArray(jsonData) || jsonData.length === 0) {
        throw new Error('No se encontraron datos en el archivo Excel');
      }

      // Encontrar el índice de la fila de encabezados
      let headerRowIndex = -1;
      for (let i = 0; i < Math.min(10, jsonData.length); i++) {
        const row = jsonData[i] as any[];
        if (row && Array.isArray(row) && row.some(cell => 
          typeof cell === 'string' && 
          (cell.toLowerCase().includes('fecha') || 
           cell.toLowerCase().includes('ejecutado') ||
           cell.toLowerCase().includes('prog'))
        )) {
          headerRowIndex = i;
          break;
        }
      }

      if (headerRowIndex === -1) {
        console.log('Contenido completo del Excel:', JSON.stringify(jsonData, null, 2));
        throw new Error('No se encontró la fila de encabezados en el Excel');
      }

      // Obtener los nombres de las columnas
      const headers = jsonData[headerRowIndex] as string[];
      console.log('Encabezados encontrados:', headers);

      // Procesar los datos desde la siguiente fila después de los encabezados
      const processedData = [];
      for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
        const row = jsonData[i] as any[];
        if (!row || !Array.isArray(row) || row.length < 3) {
          console.log('Saltando fila inválida:', row);
          continue;
        }

        const data = {
          Fecha: row[0],
          Ejecutado: parseNumber(row[1]),
          "Prog. Diaria": parseNumber(row[2]),
          "Prog. Semanal": row.length > 3 ? parseNumber(row[3]) : 0
        };

        if (data.Fecha && (data.Ejecutado > 0 || data["Prog. Diaria"] > 0)) {
          processedData.push(data);
        }
      }

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
