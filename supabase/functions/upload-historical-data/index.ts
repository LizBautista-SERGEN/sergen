
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as XLSX from 'https://esm.sh/xlsx@0.18.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function parseExcelDate(value: any): Date | null {
  if (!value) return null;
  
  try {
    if (typeof value === 'number') {
      // Handle Excel serial date
      return new Date(Math.round((value - 25569) * 86400 * 1000));
    } else if (typeof value === 'string') {
      // Try parsing string date
      const parts = value.split(/[/\-]/)
      if (parts.length === 3) {
        // Asumiendo formato DD/MM/YYYY o DD-MM-YYYY
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Meses en JS son 0-based
        const year = parseInt(parts[2]);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          return new Date(year, month, day);
        }
      }
      // Intentar parse directo si el formato es estándar
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  } catch (error) {
    console.error('Error parsing date:', value, error);
  }
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { fileName, fileContent } = await req.json()

    console.log('Procesando archivo:', fileName)

    const base64Content = fileContent.split(',')[1]
    const fileBuffer = Uint8Array.from(atob(base64Content), c => c.charCodeAt(0))

    const workbook = XLSX.read(fileBuffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    const jsonData = XLSX.utils.sheet_to_json(worksheet)

    console.log('Número de filas extraídas:', jsonData.length)

    const processedData = jsonData
      .map((row: any, index: number) => {
        console.log(`Procesando fila ${index + 1}:`, row);
        
        // Buscar la columna de fecha con diferentes nombres posibles
        const fechaValue = row.Fecha || row.fecha || row.FECHA || row.Date || row.DATE;
        const fecha = parseExcelDate(fechaValue);

        if (!fecha) {
          console.error(`⚠️ Fila ${index + 1}: Fecha inválida:`, fechaValue);
          return null;
        }

        // Buscar las columnas de datos con diferentes nombres posibles
        const reprogramacion = row['Reprogramación Diaria'] || 
                             row['REPROGRAMACION DIARIA'] || 
                             row.reprogramacion_diaria || 
                             row.Reprogramacion;

        const ejecutado = row.Ejecutado || 
                         row.EJECUTADO || 
                         row.ejecutado || 
                         row.Execution || 
                         row.EXECUTION;

        return {
          fecha: fecha.toISOString(),
          reprogramacion_diaria: typeof reprogramacion === 'number' ? reprogramacion : null,
          ejecutado: typeof ejecutado === 'number' ? ejecutado : null
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null);

    if (processedData.length === 0) {
      throw new Error('No se encontraron datos válidos en el archivo');
    }

    console.log(`Datos procesados correctamente: ${processedData.length} registros`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data, error } = await supabase
      .from('coes_historical')
      .insert(processedData)
      .select()

    if (error) {
      console.error('Error al insertar datos:', error)
      throw error
    }

    return new Response(
      JSON.stringify({
        success: true,
        count: processedData.length,
        message: `Se procesaron ${processedData.length} registros correctamente`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error en el procesamiento:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
