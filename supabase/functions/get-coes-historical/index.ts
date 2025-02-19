
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import puppeteer from 'https://deno.land/x/puppeteer@16.2.0/mod.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

interface DateRange {
  startDate: string;
  endDate: string;
}

serve(async (req) => {
  try {
    // Extraer fechas del body
    const { startDate, endDate }: DateRange = await req.json()

    if (!startDate || !endDate) {
      return new Response(
        JSON.stringify({ error: 'Se requieren fechas de inicio y fin' }),
        { status: 400 }
      )
    }

    // Inicializar el navegador
    const browser = await puppeteer.launch({
      args: ['--no-sandbox']
    })

    const page = await browser.newPage()

    // Navegar a la página del COES
    await page.goto('https://www.coes.org.pe/Portal/portalinformacion/demanda', {
      waitUntil: 'networkidle0'
    })

    // Establecer las fechas
    await page.evaluate((dates) => {
      const inputInicial = document.querySelector('#txtFechaInicial') as HTMLInputElement
      const inputFinal = document.querySelector('#txtFechaFinal') as HTMLInputElement
      if (inputInicial && inputFinal) {
        inputInicial.value = dates.startDate
        inputFinal.value = dates.endDate
        inputInicial.dispatchEvent(new Event('input', { bubbles: true }))
        inputFinal.dispatchEvent(new Event('input', { bubbles: true }))
      }
    }, { startDate, endDate })

    // Hacer clic en consultar
    await page.click('#btnConsultar')
    await page.waitForTimeout(3000)

    // Obtener los datos de la tabla
    const data = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tr'))
      return rows.map(row => {
        const cells = Array.from(row.querySelectorAll('td'))
        return cells.map(cell => cell.textContent?.trim())
      }).filter(row => row.length > 0)
    })

    await browser.close()

    // Guardar los datos en Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error: insertError } = await supabase
      .from('coes_historical')
      .upsert(
        data.map(row => ({
          fecha: row[0],
          reprogramacion_diaria: parseFloat(row[1] || '0'),
          ejecutado: parseFloat(row[2] || '0'),
          created_at: new Date().toISOString()
        }))
      )

    if (insertError) {
      throw new Error(`Error al insertar datos: ${insertError.message}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Datos históricos obtenidos y guardados correctamente',
        count: data.length 
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: 'Error al obtener datos históricos',
        details: error.message 
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
