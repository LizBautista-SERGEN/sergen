
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as XLSX from 'https://deno.land/x/sheetjs@v0.18.3/xlsx.mjs'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('🚀 Iniciando función upload-historical-data');

  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('📥 Procesando archivo...');
    
    const { fileName, fileContent, contentType } = await req.json();
    
    if (!fileContent || !fileName) {
      throw new Error('No se proporcionó un archivo válido');
    }

    console.log('📄 Archivo recibido:', fileName);

    // Convert base64 to array buffer
    const base64Data = fileContent.split(',')[1];
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Parse Excel data using XLSX
    const workbook = XLSX.read(bytes.buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new Error('El archivo no contiene hojas de cálculo');
    }

    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    console.log('📊 Procesando datos del Excel...');

    // Process data
    const data = [];
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row[0]) continue;

      const fecha = new Date(row[0]);
      if (isNaN(fecha.getTime())) {
        console.warn(`⚠️ Fila ${i + 1}: Fecha inválida:`, row[0]);
        continue;
      }

      data.push({
        fecha: fecha.toISOString(),
        ejecutado: parseFloat(row[1] || '0'),
        reprogramacion_diaria: parseFloat(row[2] || '0'),
        created_at: new Date().toISOString()
      });
    }

    console.log(`✅ Datos procesados: ${data.length} registros`);

    // Save to Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('💾 Guardando datos en Supabase...');
    const { error } = await supabase
      .from('coes_historical')
      .upsert(data);

    if (error) {
      console.error('❌ Error al guardar en Supabase:', error);
      throw error;
    }

    console.log('✨ Datos guardados exitosamente');
    return new Response(
      JSON.stringify({ 
        success: true, 
        count: data.length,
        message: 'Datos guardados exitosamente' 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('❌ Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Error al procesar el archivo', 
        details: error.message,
        stack: error.stack 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
