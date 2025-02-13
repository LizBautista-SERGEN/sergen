
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { read, utils } from 'https://deno.land/x/excel@v1.4.5/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.1.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

const parseNumber = (value: string | number): number => {
  try {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    const cleanValue = value.toString().replace(/\s/g, '').replace(',', '.');
    const number = parseFloat(cleanValue);
    return isNaN(number) ? 0 : number;
  } catch (error) {
    console.error('Error parseando número:', value, error);
    return 0;
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const pronosticoUrl = 'https://www.coes.org.pe/Portal/portalinformacion/ExportarPronosticoTiempoReal';
    
    console.log('Iniciando proceso de descarga desde:', pronosticoUrl);

    const response = await fetch(pronosticoUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      }
    });

    if (!response.ok) {
      throw new Error(`Error en la descarga: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    console.log('Tipo de contenido recibido:', contentType);

    // Verificar si es un archivo Excel
    if (contentType?.includes('excel') || contentType?.includes('spreadsheet')) {
      const arrayBuffer = await response.arrayBuffer();
      const workbook = read(new Uint8Array(arrayBuffer));
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet);

      console.log('Datos del Excel:', jsonData);

      const processedData = jsonData.map((row: any) => {
        // Intentar diferentes nombres de columnas posibles
        const fecha = row['Fecha'] || row['FECHA'] || row['Fecha/Hora'] || row['FECHA/HORA'];
        const ejecutado = parseNumber(row['Ejecutado'] || row['EJECUTADO'] || row['Demanda'] || row['DEMANDA'] || 0);
        const progDiaria = parseNumber(row['Prog. Diaria'] || row['PROG. DIARIA'] || row['Programado'] || row['PROGRAMADO'] || 0);
        const progSemanal = parseNumber(row['Prog. Semanal'] || row['PROG. SEMANAL'] || row['Programado Semanal'] || row['PROGRAMADO SEMANAL'] || 0);

        return {
          Fecha: fecha,
          Ejecutado: ejecutado,
          "Prog. Diaria": progDiaria,
          "Prog. Semanal": progSemanal
        };
      }).filter(row => row.Fecha && (row.Ejecutado > 0 || row["Prog. Diaria"] > 0));

      if (processedData.length === 0) {
        throw new Error('No se encontraron datos válidos en el archivo Excel');
      }

      console.log(`Datos procesados: ${processedData.length} registros`);
      console.log('Muestra de datos:', processedData[0]);

      // Guardar datos en la base de datos
      for (const item of processedData) {
        const { error: insertError } = await supabase
          .from('coes_demand_data')
          .upsert({
            date: item.Fecha,
            executed_power: item.Ejecutado,
            daily_forecast: item["Prog. Diaria"],
            weekly_forecast: item["Prog. Semanal"],
            created_at: new Date()
          });

        if (insertError) {
          console.error('Error al insertar datos:', insertError);
        }
      }

      return new Response(JSON.stringify(processedData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else {
      throw new Error('La respuesta no es un archivo Excel válido');
    }

  } catch (error) {
    console.error('Error en el proceso:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Error al obtener datos del COES',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
