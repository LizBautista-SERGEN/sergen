
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { parse } from 'https://deno.land/x/excel@v1.1.2/mod.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    // Parse Excel data
    const workbook = parse(binaryData);
    const worksheet = workbook.sheets[0];

    if (!worksheet) {
      throw new Error('El archivo no contiene hojas de cálculo');
    }

    console.log('📊 Procesando datos del Excel...');

    // Process data
    const data = [];
    for (let i = 1; i < worksheet.rows.length; i++) {
      const row = worksheet.rows[i];
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
