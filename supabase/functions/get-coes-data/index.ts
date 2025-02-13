
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
    const pronosticoUrl = `${baseUrl}/Portal/portalinformacion/ExportarPronosticoTiempoReal`;
    
    console.log('Iniciando proceso con URL:', pronosticoUrl);

    // Cookies recibidas
    const cookies = req.headers.get('cookie');
    console.log('Cookies recibidas:', cookies);

    const requestHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'max-age=0',
      'Connection': 'keep-alive',
      'Host': 'www.coes.org.pe',
      'Referer': 'https://www.coes.org.pe/Portal/',
      'Sec-Ch-Ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
      ...(cookies ? { 'Cookie': cookies } : {})
    };

    const initialResponse = await fetch(baseUrl + '/Portal/', {
      method: 'GET',
      headers: requestHeaders,
    });

    const sessionCookies = initialResponse.headers.get('set-cookie');
    if (sessionCookies) {
      requestHeaders['Cookie'] = sessionCookies;
    }

    console.log('Headers de petición:', requestHeaders);
    
    const dataResponse = await fetch(pronosticoUrl, {
      method: 'GET',
      headers: requestHeaders,
      redirect: 'follow'
    });

    console.log('Status de respuesta:', dataResponse.status);
    console.log('Headers de respuesta:', Object.fromEntries(dataResponse.headers));
    console.log('Content-Type de respuesta:', dataResponse.headers.get('content-type'));
    
    if (!dataResponse.ok) {
      console.error('Error en respuesta del COES:', {
        status: dataResponse.status,
        statusText: dataResponse.statusText,
        url: pronosticoUrl,
      });
      const errorText = await dataResponse.text();
      console.error('Contenido de error:', errorText);
      throw new Error(`Error en respuesta del COES: ${dataResponse.status}`);
    }

    const html = await dataResponse.text();
    console.log('Longitud de la respuesta:', html.length);
    
    // Si la respuesta es muy corta, probablemente sea un error o redirección
    if (html.length < 100) {
      console.error('Respuesta demasiado corta:', html);
      throw new Error('Respuesta incompleta del servidor');
    }

    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");

    if (!document) {
      console.error('Error al parsear HTML');
      throw new Error('No se pudo parsear el HTML');
    }

    // Primero intentamos encontrar la tabla por su contenido
    const tables = document.querySelectorAll("table");
    console.log(`Tablas encontradas: ${tables.length}`);

    let targetTable = null;
    let data = [];

    // Primero intentamos encontrar una tabla completa
    for (const table of tables) {
      if (table.textContent?.includes('Ejecutado') || table.textContent?.includes('Prog. Diaria')) {
        targetTable = table;
        break;
      }
    }

    // Si no encontramos una tabla, buscamos las filas directamente
    if (!targetTable) {
      console.log('Buscando datos en el HTML raw...');
      const rowMatches = html.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
      
      if (rowMatches) {
        console.log(`Encontradas ${rowMatches.length} filas en HTML raw`);
        
        // Procesar cada fila encontrada
        for (const row of rowMatches) {
          const cellMatches = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi);
          
          if (cellMatches && cellMatches.length >= 4) {
            const cleanCells = cellMatches.map(cell => {
              return cell.replace(/<[^>]+>/g, '').trim();
            });

            const [fechaHora, ejecutado, progDiaria, progSemanal] = cleanCells;
            
            data.push({
              Fecha: fechaHora,
              Ejecutado: parseNumber(ejecutado),
              "Prog. Diaria": parseNumber(progDiaria),
              "Prog. Semanal": parseNumber(progSemanal)
            });
          }
        }
      }
    } else {
      // Procesar la tabla si la encontramos
      const rows = targetTable.querySelectorAll("tr");
      
      for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].querySelectorAll("td");
        if (cells.length >= 4) {
          data.push({
            Fecha: cells[0].textContent?.trim() || '',
            Ejecutado: parseNumber(cells[1].textContent || '0'),
            "Prog. Diaria": parseNumber(cells[2].textContent || '0'),
            "Prog. Semanal": parseNumber(cells[3].textContent || '0')
          });
        }
      }
    }

    if (data.length === 0) {
      console.error('No se encontraron datos en la respuesta');
      throw new Error('No se encontraron datos en la respuesta');
    }

    console.log(`Datos procesados: ${data.length} registros`);

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
