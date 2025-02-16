
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from '@supabase/supabase-js'
import puppeteer from 'https://deno.land/x/puppeteer@16.2.0/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();

    console.log("Navegando a la página del COES...");
    await page.goto('https://www.coes.org.pe/Portal/portalinformacion/demanda');
    
    // Esperar a que la página cargue
    await page.waitForSelector('#btnPronosticoTR');
    
    // Hacer clic en la pestaña de pronóstico
    await page.click('#btnPronosticoTR');
    
    // Esperar a que los datos se carguen
    await page.waitForSelector('.k-grid-content');
    
    // Extraer los datos
    const data = await page.evaluate(() => {
      const rows = document.querySelectorAll('.k-grid-content tr');
      return Array.from(rows).map(row => {
        const cells = row.querySelectorAll('td');
        return {
          fecha: cells[0]?.textContent,
          pronostico: parseFloat(cells[1]?.textContent?.replace(',', '') || '0'),
          reprogramacion_diaria: parseFloat(cells[2]?.textContent?.replace(',', '') || '0'),
          rango_minimo: parseFloat(cells[3]?.textContent?.replace(',', '') || '0'),
          rango_maximo: parseFloat(cells[4]?.textContent?.replace(',', '') || '0'),
          ejecutado: parseFloat(cells[5]?.textContent?.replace(',', '') || '0')
        };
      });
    });

    await browser.close();

    // Guardar los datos en Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    for (const item of data) {
      const { error } = await supabase
        .from('coes_forecast')
        .upsert({
          fecha: new Date(item.fecha),
          pronostico: item.pronostico,
          reprogramacion_diaria: item.reprogramacion_diaria,
          rango_minimo: item.rango_minimo,
          rango_maximo: item.rango_maximo,
          ejecutado: item.ejecutado
        }, {
          onConflict: 'fecha'
        });

      if (error) {
        console.error('Error insertando datos:', error);
      }
    }

    return new Response(
      JSON.stringify({ success: true, data }),
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
