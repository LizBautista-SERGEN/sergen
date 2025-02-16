
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
  
  // Leer el Excel de la manera más simple posible
  const rawData = XLSX.utils.sheet_to_json(worksheet, { 
    header: 1,
    raw: true,
    dateNF: 'yyyy-mm-dd HH:mm:ss'
  });

  console.log('Datos crudos del Excel:', rawData);

  // Mapeo directo de columnas
  const headerRow = rawData[0];
  const columnIndexes = {
    fecha: headerRow.findIndex((col: string) => col === 'Fecha'),
    reprogramacion: headerRow.findIndex((col: string) => col === 'Reprogramación Diaria'),
    pronostico: headerRow.findIndex((col: string) => col === 'Pronóstico'),
    rangoMinimo: headerRow.findIndex((col: string) => col === 'Rango Minimo'),
    rangoMaximo: headerRow.findIndex((col: string) => col === 'Rango Máximo'),
    ejecutado: headerRow.findIndex((col: string) => col === 'Ejecutado')
  };

  const now = new Date().toISOString();

  // Procesar los datos sin filtros
  const processedData = rawData.slice(1)
    .filter((row: any[]) => Array.isArray(row) && row.length >= 6)
    .map((row: any[]) => {
      return {
        fecha: row[columnIndexes.fecha],
        reprogramacion_diaria: row[columnIndexes.reprogramacion],
        pronostico: row[columnIndexes.pronostico],
        rango_minimo: row[columnIndexes.rangoMinimo],
        rango_maximo: row[columnIndexes.rangoMaximo],
        ejecutado: row[columnIndexes.ejecutado],
        created_at: now,
        updated_at: now
      };
    });

  console.log('Datos procesados (sin filtros):', processedData);
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
      throw new Error('No se encontraron datos en el Excel');
    }

    // Guardar los datos en Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Insertar los datos sin eliminar los anteriores
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
