
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
  
  const rawData = XLSX.utils.sheet_to_json(worksheet, { 
    header: 1,
    raw: true,
    dateNF: 'yyyy-mm-dd HH:mm:ss'
  });

  console.log('Datos crudos del Excel:', rawData);

  // Actualizar los índices de las columnas con los nuevos nombres
  const headerRow = rawData[0];
  const columnIndexes = {
    fecha: headerRow.findIndex((col: string) => col === 'Fecha'),
    reprogramacion: headerRow.findIndex((col: string) => col === 'Reprogramación Diaria'),
    pronostico_diario: headerRow.findIndex((col: string) => col === 'Pronóstico'),
    rango_inferior: headerRow.findIndex((col: string) => col === 'Rango Minimo'),
    rango_superior: headerRow.findIndex((col: string) => col === 'Rango Máximo'),
    demanda_real: headerRow.findIndex((col: string) => col === 'Ejecutado')
  };

  const now = new Date().toISOString();

  const processedData = rawData.slice(1)
    .filter((row: any[]) => Array.isArray(row) && row.length >= 6)
    .map((row: any[]) => {
      return {
        fecha: row[columnIndexes.fecha],
        reprogramacion: row[columnIndexes.reprogramacion],
        pronostico_diario: row[columnIndexes.pronostico_diario],
        rango_inferior: row[columnIndexes.rango_inferior],
        rango_superior: row[columnIndexes.rango_superior],
        demanda_real: row[columnIndexes.demanda_real],
        created_at: now,
        updated_at: now
      };
    });

  console.log('Datos procesados:', processedData);
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

    if (!processedData.length) {
      throw new Error('No se encontraron datos en el Excel');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

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
