
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
  const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

  console.log('Datos crudos del Excel:', rawData);

  // Mapeo de columnas según los encabezados del Excel
  const headerRow = rawData[0];
  const columnIndexes = {
    fecha: headerRow.findIndex((col: string) => col === 'Fecha'),
    reprogramacion: headerRow.findIndex((col: string) => col === 'Reprogramación Diaria'),
    pronostico: headerRow.findIndex((col: string) => col === 'Pronóstico de Demanda Automático de Tiempo Real'),
    rangoMinimo: headerRow.findIndex((col: string) => col === 'Rango Mínimo del Pronóstico de Demanda Automático de Tiempo Real'),
    rangoMaximo: headerRow.findIndex((col: string) => col === 'Rango Máximo del Pronóstico de Demanda Automático de Tiempo Real'),
    ejecutado: headerRow.findIndex((col: string) => col === 'Ejecutado')
  };

  // Verificar que todas las columnas necesarias existen
  const missingColumns = Object.entries(columnIndexes)
    .filter(([_, index]) => index === -1)
    .map(([name]) => name);

  if (missingColumns.length > 0) {
    console.error('Columnas faltantes:', missingColumns);
    throw new Error(`Columnas faltantes en el Excel: ${missingColumns.join(', ')}`);
  }

  // Procesar los datos, eliminando la primera fila (encabezados)
  return rawData.slice(1)
    .filter((row: any[]) => Array.isArray(row) && row.length >= 6)
    .map((row: any[]) => {
      // Asegurarse de que la fecha se procese correctamente
      const fechaStr = row[columnIndexes.fecha];
      let fecha;
      try {
        fecha = new Date(fechaStr);
        if (isNaN(fecha.getTime())) {
          throw new Error('Fecha inválida');
        }
      } catch (error) {
        console.error('Error procesando fecha:', fechaStr);
        return null;
      }

      const parseNumber = (value: any) => {
        const num = parseFloat(value);
        return isNaN(num) ? null : num;
      };

      return {
        fecha: fecha.toISOString(),
        reprogramacion_diaria: parseNumber(row[columnIndexes.reprogramacion]),
        pronostico: parseNumber(row[columnIndexes.pronostico]),
        rango_minimo: parseNumber(row[columnIndexes.rangoMinimo]),
        rango_maximo: parseNumber(row[columnIndexes.rangoMaximo]),
        ejecutado: parseNumber(row[columnIndexes.ejecutado])
      };
    })
    .filter(row => row !== null); // Eliminar filas con fechas inválidas
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

    console.log("Datos procesados:", processedData);

    // Guardar los datos en Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Insertar datos en lotes
    const { error } = await supabase
      .from('coes_forecast')
      .upsert(processedData, {
        onConflict: 'fecha'
      });

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
