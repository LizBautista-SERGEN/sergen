
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import * as XLSX from 'https://cdn.sheetjs.com/xlsx-0.20.0/package/xlsx.mjs';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function parseExcelDate(fechaStr: string): Date | null {
  // Intenta diferentes formatos de fecha
  const formats = [
    // Formato dd/mm/yyyy hh:mm
    (str: string) => {
      const [datePart, timePart] = str.split(' ');
      if (!datePart || !timePart) return null;
      
      const [day, month, year] = datePart.split('/').map(Number);
      const [hour, minute] = timePart.split(':').map(Number);
      
      if (!day || !month || !year || isNaN(hour) || isNaN(minute)) return null;
      
      const date = new Date(year, month - 1, day, hour, minute);
      return date;
    },
    // Formato Excel (número serial)
    (str: string) => {
      const excelEpoch = new Date(1899, 11, 30);
      const daysSince = parseFloat(str);
      if (isNaN(daysSince)) return null;
      
      const millisSince = daysSince * 24 * 60 * 60 * 1000;
      const date = new Date(excelEpoch.getTime() + millisSince);
      return date;
    }
  ];

  for (const format of formats) {
    try {
      const date = format(fechaStr);
      if (date && !isNaN(date.getTime())) {
        return date;
      }
    } catch (e) {
      continue;
    }
  }

  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { fileName, fileContent, contentType } = await req.json()

    // Convertir base64 a array buffer
    const base64Data = fileContent.split(',')[1];
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Leer el archivo Excel con opciones específicas
    const workbook = XLSX.read(bytes.buffer, {
      type: 'array',
      cellDates: true, // Intentar convertir fechas automáticamente
      dateNF: 'dd/mm/yyyy hh:mm' // Formato de fecha esperado
    });
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    console.log(`Total de filas en Excel: ${jsonData.length}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Procesar y validar los datos
    const processedData = jsonData.map((row: any, index: number) => {
      const fechaValue = row['FECHA'];
      if (!fechaValue) {
        console.error(`Fila ${index + 1}: Fecha vacía`);
        return null;
      }

      const fecha = parseExcelDate(fechaValue.toString());
      if (!fecha) {
        console.error(`Fila ${index + 1}: Fecha inválida:`, fechaValue);
        return null;
      }

      const ejecutado = row['EJECUTADO'];
      if (ejecutado === undefined || ejecutado === null || isNaN(Number(ejecutado))) {
        console.error(`Fila ${index + 1}: Valor ejecutado inválido:`, ejecutado);
        return null;
      }

      return {
        fecha: fecha.toISOString(),
        ejecutado: Number(ejecutado)
      };
    }).filter(row => row !== null);

    console.log(`Filas procesadas válidas: ${processedData.length}`);

    if (processedData.length === 0) {
      throw new Error('No se encontraron datos válidos para procesar');
    }

    // Eliminar datos existentes
    const { error: deleteError } = await supabase
      .from('coes_historical')
      .delete()
      .not('id', 'is', null);

    if (deleteError) {
      throw new Error('Error al eliminar datos existentes: ' + deleteError.message);
    }

    // Insertar nuevos datos históricos
    const { error: insertError } = await supabase
      .from('coes_historical')
      .insert(processedData);

    if (insertError) {
      throw new Error('Error al insertar datos: ' + insertError.message);
    }

    // Procesar y almacenar picos de potencia (18:00 - 23:00)
    const powerPeaks = processedData.reduce((peaks: any[], row: any) => {
      const fecha = new Date(row.fecha);
      const hora = fecha.getHours();
      
      if (hora >= 18 && hora <= 23) {
        const fechaKey = fecha.toISOString().split('T')[0];
        const existingPeak = peaks.find(p => p.date === fechaKey);
        
        if (!existingPeak && row.ejecutado) {
          peaks.push({
            date: fechaKey,
            peak_time: `${hora.toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}`,
            peak_value: row.ejecutado,
            is_modulated: false
          });
        } else if (existingPeak && row.ejecutado && row.ejecutado > existingPeak.peak_value) {
          existingPeak.peak_time = `${hora.toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}`;
          existingPeak.peak_value = row.ejecutado;
        }
      }
      return peaks;
    }, []);

    // Limpiar tabla de picos existentes
    const { error: deletePeaksError } = await supabase
      .from('power_peaks')
      .delete()
      .not('id', 'is', null);

    if (deletePeaksError) {
      throw new Error('Error al eliminar picos existentes: ' + deletePeaksError.message);
    }

    // Insertar nuevos picos de potencia
    if (powerPeaks.length > 0) {
      const { error: insertPeaksError } = await supabase
        .from('power_peaks')
        .insert(powerPeaks);

      if (insertPeaksError) {
        throw new Error('Error al insertar picos de potencia: ' + insertPeaksError.message);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Datos procesados correctamente',
        totalRows: jsonData.length,
        processedRows: processedData.length,
        peaksCount: powerPeaks.length,
        skippedRows: jsonData.length - processedData.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
