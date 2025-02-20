
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import * as XLSX from 'https://cdn.sheetjs.com/xlsx-0.20.0/package/xlsx.mjs';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Leer el archivo Excel
    const workbook = XLSX.read(bytes.buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Procesar y validar los datos
    const processedData = jsonData.map((row: any) => {
      const fechaStr = row['FECHA'];
      const fecha = new Date(fechaStr);
      
      if (isNaN(fecha.getTime())) {
        console.error('Fecha inválida:', fechaStr);
        return null;
      }

      return {
        fecha: fecha.toISOString(),
        ejecutado: row['EJECUTADO'] || null,
        demanda_programada: row['PROG. DIARIA'] || null,
        prog_semanal: row['PROG. SEMANAL'] || null,
      };
    }).filter(row => row !== null);

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

    // Procesar picos de potencia (18:00 - 23:00)
    const powerPeaks = processedData.reduce((peaks: any[], row: any) => {
      const fecha = new Date(row.fecha);
      const hora = fecha.getHours();
      
      // Solo procesar datos entre 18:00 y 23:00
      if (hora >= 18 && hora <= 23) {
        const fechaKey = fecha.toISOString().split('T')[0]; // Obtener solo la fecha
        const existingPeak = peaks.find(p => p.date === fechaKey);
        
        if (!existingPeak) {
          peaks.push({
            date: fechaKey,
            peak_time: `${hora.toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}`,
            peak_value: row.ejecutado,
          });
        } else if (row.ejecutado > existingPeak.peak_value) {
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
    const { error: insertPeaksError } = await supabase
      .from('power_peaks')
      .insert(powerPeaks);

    if (insertPeaksError) {
      throw new Error('Error al insertar picos de potencia: ' + insertPeaksError.message);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Datos procesados correctamente',
        rowCount: processedData.length,
        peaksCount: powerPeaks.length
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
