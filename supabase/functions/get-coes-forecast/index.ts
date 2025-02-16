
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.31.0'
import * as XLSX from 'npm:xlsx@0.18.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function processExcelData(arrayBuffer: ArrayBuffer) {
  const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array', cellDates: true });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  
  // Configuración específica para la lectura del Excel
  const rawData = XLSX.utils.sheet_to_json(worksheet, { 
    header: 1,
    raw: false,
    dateNF: 'yyyy-mm-dd HH:mm:ss'
  });

  console.log('Primera fila de datos del Excel:', rawData[1]);

  // Mapeo de columnas según los encabezados del Excel
  const headerRow = rawData[0];
  console.log('Encabezados del Excel:', headerRow);

  const columnIndexes = {
    fecha: headerRow.findIndex((col: string) => col === 'Fecha'),
    reprogramacion: headerRow.findIndex((col: string) => col === 'Reprogramación Diaria'),
    pronostico: headerRow.findIndex((col: string) => col === 'Pronóstico de Demanda Automático de Tiempo Real'),
    rangoMinimo: headerRow.findIndex((col: string) => col === 'Rango Mínimo del Pronóstico de Demanda Automático de Tiempo Real'),
    rangoMaximo: headerRow.findIndex((col: string) => col === 'Rango Máximo del Pronóstico de Demanda Automático de Tiempo Real'),
    ejecutado: headerRow.findIndex((col: string) => col === 'Ejecutado')
  };

  console.log('Índices de columnas encontrados:', columnIndexes);

  // Verificar que todas las columnas necesarias existen
  const missingColumns = Object.entries(columnIndexes)
    .filter(([_, index]) => index === -1)
    .map(([name]) => name);

  if (missingColumns.length > 0) {
    console.error('Columnas faltantes:', missingColumns);
    throw new Error(`Columnas faltantes en el Excel: ${missingColumns.join(', ')}`);
  }

  const now = new Date().toISOString();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Procesar los datos, eliminando la primera fila (encabezados)
  const processedData = rawData.slice(1)
    .filter((row: any[]) => Array.isArray(row) && row.length >= 6)
    .map((row: any[], index: number) => {
      // Asegurarse de que la fecha se procese correctamente
      const fechaStr = row[columnIndexes.fecha];
      console.log(`Procesando fila ${index + 2}, fecha original:`, fechaStr);

      let fecha;
      try {
        fecha = new Date(fechaStr);
        if (isNaN(fecha.getTime())) {
          console.error(`Fecha inválida en fila ${index + 2}:`, fechaStr);
          return null;
        }

        // Verificar si la fecha es del día actual
        const rowDate = new Date(fecha);
        rowDate.setHours(0, 0, 0, 0);
        if (rowDate.getTime() !== today.getTime()) {
          console.log(`Ignorando fecha no actual en fila ${index + 2}:`, fechaStr);
          return null;
        }

        const parseNumber = (value: any) => {
          if (value === undefined || value === null || value === '') {
            return null;
          }
          const num = parseFloat(value);
          return isNaN(num) ? null : num;
        };

        const data = {
          fecha: fecha.toISOString(),
          reprogramacion_diaria: parseNumber(row[columnIndexes.reprogramacion]),
          pronostico: parseNumber(row[columnIndexes.pronostico]),
          rango_minimo: parseNumber(row[columnIndexes.rangoMinimo]),
          rango_maximo: parseNumber(row[columnIndexes.rangoMaximo]),
          ejecutado: parseNumber(row[columnIndexes.ejecutado]),
          created_at: now,
          updated_at: now
        };

        console.log(`Datos procesados fila ${index + 2}:`, data);
        return data;

      } catch (error) {
        console.error(`Error procesando fila ${index + 2}:`, error);
        return null;
      }
    })
    .filter(row => row !== null);

  console.log('Total de filas procesadas:', processedData.length);
  if (processedData.length > 0) {
    console.log('Primera fila procesada:', processedData[0]);
    console.log('Última fila procesada:', processedData[processedData.length - 1]);
  }

  return processedData;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log("Descargando archivo Excel del COES...");
    const response = await fetch('https://www.coes.org.pe//Portal/portalinformacion/ExportarPronosticoTiempoReal');
    
    if (!response.ok) {
      throw new Error(`Error al descargar el archivo: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const processedData = await processExcelData(arrayBuffer);

    // Verificar que tengamos datos para procesar
    if (!processedData.length) {
      throw new Error('No se encontraron datos para el día actual en el Excel');
    }

    // Guardar los datos en Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Primero, eliminar los datos antiguos del día actual
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { error: deleteError } = await supabase
      .from('coes_forecast')
      .delete()
      .gte('fecha', today.toISOString())
      .lt(new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString());

    if (deleteError) {
      console.error('Error eliminando datos antiguos:', deleteError);
      throw deleteError;
    }

    // Insertar los nuevos datos
    const { error } = await supabase
      .from('coes_forecast')
      .insert(processedData);

    if (error) {
      console.error('Error insertando datos:', error);
      throw error;
    }

    console.log(`Se procesaron ${processedData.length} registros correctamente`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: processedData,
        count: processedData.length
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      },
    )
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      },
    )
  }
})
