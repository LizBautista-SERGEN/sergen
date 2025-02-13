
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.1.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

const parseNumber = (value: string): number => {
  try {
    if (!value) return 0;
    const cleanValue = value.replace(/\s/g, '').replace(',', '.');
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
    const baseUrl = 'https://www.coes.org.pe';
    const portalUrl = `${baseUrl}/Portal/`;
    const pronosticoUrl = `${baseUrl}/Portal/portalinformacion/ExportarPronosticoTiempoReal`;
    
    console.log('Iniciando proceso...');

    // Primera petición para obtener cookies iniciales
    const initialResponse = await fetch(portalUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      }
    });

    if (!initialResponse.ok) {
      throw new Error(`Error en petición inicial: ${initialResponse.status}`);
    }

    const cookies = initialResponse.headers.get('set-cookie');
    console.log('Cookies iniciales:', cookies);

    // Construir headers con las cookies obtenidas
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Referer': portalUrl,
      'Sec-Ch-Ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'same-origin',
      'Upgrade-Insecure-Requests': '1',
    };

    if (cookies) {
      headers['Cookie'] = cookies;
    }

    // Segunda petición para obtener los datos
    console.log('Realizando petición de datos con headers:', headers);
    const dataResponse = await fetch(pronosticoUrl, {
      method: 'GET',
      headers,
      redirect: 'follow'
    });

    console.log('Status de respuesta:', dataResponse.status);
    console.log('Headers de respuesta:', Object.fromEntries(dataResponse.headers));
    
    if (!dataResponse.ok) {
      throw new Error(`Error en respuesta del COES: ${dataResponse.status}`);
    }

    const html = await dataResponse.text();
    console.log('Longitud de respuesta:', html.length);
    console.log('Primeros 500 caracteres:', html.substring(0, 500));

    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");

    if (!document) {
      throw new Error('No se pudo parsear el HTML');
    }

    let data = [];
    const regex = /<tr[^>]*>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>[\s\S]*?<\/tr>/gi;
    let match;

    while ((match = regex.exec(html)) !== null) {
      const [_, fechaHora, ejecutado, progDiaria, progSemanal] = match.map(val => 
        val?.replace(/<[^>]+>/g, '').trim() || ''
      );

      // Validar que tenemos datos numéricos
      const ejecutadoNum = parseNumber(ejecutado);
      const progDiariaNum = parseNumber(progDiaria);
      const progSemanalNum = parseNumber(progSemanal);

      if (fechaHora && (ejecutadoNum > 0 || progDiariaNum > 0)) {
        data.push({
          Fecha: fechaHora,
          Ejecutado: ejecutadoNum,
          "Prog. Diaria": progDiariaNum,
          "Prog. Semanal": progSemanalNum
        });
      }
    }

    if (data.length === 0) {
      // Intento alternativo: buscar en tablas del DOM
      const tables = document.querySelectorAll('table');
      console.log(`Tablas encontradas: ${tables.length}`);

      for (const table of tables) {
        const rows = table.querySelectorAll('tr');
        console.log(`Filas en tabla: ${rows.length}`);

        for (let i = 1; i < rows.length; i++) {
          const cells = rows[i].querySelectorAll('td');
          if (cells.length >= 4) {
            const fechaHora = cells[0].textContent?.trim() || '';
            const ejecutado = parseNumber(cells[1].textContent || '0');
            const progDiaria = parseNumber(cells[2].textContent || '0');
            const progSemanal = parseNumber(cells[3].textContent || '0');

            if (fechaHora && (ejecutado > 0 || progDiaria > 0)) {
              data.push({
                Fecha: fechaHora,
                Ejecutado: ejecutado,
                "Prog. Diaria": progDiaria,
                "Prog. Semanal": progSemanal
              });
            }
          }
        }
      }
    }

    if (data.length === 0) {
      throw new Error('No se encontraron datos en la respuesta');
    }

    console.log(`Datos encontrados: ${data.length} registros`);
    console.log('Primer registro:', data[0]);

    // Guardar datos en la base de datos
    for (const item of data) {
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

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error en el scraping:', error);
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
