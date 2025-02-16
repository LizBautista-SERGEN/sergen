import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.31.0'
import * as XLSX from 'npm:xlsx@0.18.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function parseExcelDate(date: any): string {
  if (!date) return '';
  
  // Si es un objeto Date, lo convertimos directamente
  if (date instanceof Date) {
    return date.toISOString();
  }
  
  // Si es un número (fecha en formato Excel), lo convertimos a fecha
  if (typeof date === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
    const utcDate = new Date(excelEpoch.getTime() + (date * 24 * 60 * 60 * 1000));
    return utcDate.toISOString();
  }
  
  // Si es string, intentamos parsearlo
  try {
    const parsedDate = new Date(date);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString();
    }
  } catch (error) {
    console.error('Error parsing date:', error);
  }
  
  return '';
}

function parseNumber(value: any): number | null {
  if (value === null || value === undefined || value === '') return null;
  
  // Si ya es un número, lo retornamos
  if (typeof value === 'number') return value;
  
  // Si es string, intentamos convertirlo
  if (typeof value === 'string') {
    // Removemos espacios y reemplazamos comas por puntos
    const cleanValue = value.trim().replace(',', '.');
    const number = parseFloat(cleanValue);
    return isNaN(number) ? null : number;
  }
  
  return null;
}

async function processExcelData(arrayBuffer: ArrayBuffer) {
  const workbook = XLSX.read(new Uint8Array(arrayBuffer), { 
    type: 'array',
    cellDates: true,
    dateNF: 'yyyy-mm-dd HH:mm:ss'
  });
  
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  
  const rawData = XLSX.utils.sheet_to_json(worksheet, { 
    header: 1,
    raw: true,
    dateNF: 'yyyy-mm-dd HH:mm:ss'
  });

  console.log('Datos crudos del Excel:', rawData);

  const headerRow = rawData[0];
  const columnIndexes = {
    fecha: headerRow.findIndex((col: string) => 
      typeof col === 'string' && col.toLowerCase().includes('fecha')),
    reprogramacion: headerRow.findIndex((col: string) => 
      typeof col === 'string' && col.toLowerCase().includes('reprogramación')),
    pronostico_diario: headerRow.findIndex((col: string) => 
      typeof col === 'string' && (
        col.toLowerCase().includes('pronóstico') || 
        col.toLowerCase().includes('pronostico')
      )),
    rango_inferior: headerRow.findIndex((col: string) => 
      typeof col === 'string' && col.toLowerCase().includes('mínimo')),
    rango_superior: headerRow.findIndex((col: string) => 
      typeof col === 'string' && col.toLowerCase().includes('máximo')),
    demanda_real: headerRow.findIndex((col: string) => 
      typeof col === 'string' && col.toLowerCase().includes('ejecutado'))
  };

  console.log('Índices de columnas encontrados:', columnIndexes);

  const now = new Date().toISOString();

  const processedData = rawData.slice(1)
    .filter((row: any[]) => Array.isArray(row) && row.length >= 6)
    .map((row: any[]) => {
      const fecha = parseExcelDate(row[columnIndexes.fecha]);
      if (!fecha) {
        console.log('Fila ignorada por fecha inválida:', row);
        return null;
      }

      const data = {
        fecha,
        reprogramacion: parseNumber(row[columnIndexes.reprogramacion]),
        pronostico_diario: parseNumber(row[columnIndexes.pronostico_diario]),
        rango_inferior: parseNumber(row[columnIndexes.rango_inferior]),
        rango_superior: parseNumber(row[columnIndexes.rango_superior]),
        demanda_real: parseNumber(row[columnIndexes.demanda_real]),
        created_at: now,
        updated_at: now
      };

      console.log('Fila procesada:', data);
      return data;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

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
      .upsert(processedData, {
        onConflict: 'fecha',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Error actualizando datos:', error);
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
