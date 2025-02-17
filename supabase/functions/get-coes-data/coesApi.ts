
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

export const extractCoesData = async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    // Configurar el User-Agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Calcular fechas
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 3);
    const endDate = new Date(today);
    endDate.setDate(today.getDate() - 1);

    const formatDateStr = (date: Date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const startDateStr = formatDateStr(startDate);
    const endDateStr = formatDateStr(endDate);

    console.log('Fechas de consulta:', { startDateStr, endDateStr });

    // Navegar a la página
    await page.goto('https://www.coes.org.pe/Portal/portalinformacion/demanda', {
      waitUntil: 'networkidle0',
      timeout: 60000,
    });

    // Esperar a que los elementos estén disponibles
    await page.waitForSelector('#txtFechaInicial', { timeout: 10000 });
    await page.waitForSelector('#txtFechaFinal', { timeout: 10000 });

    // Limpiar y establecer las fechas
    await page.evaluate((inicio, fin) => {
      const fechaInicial = document.querySelector<HTMLInputElement>('#txtFechaInicial');
      const fechaFinal = document.querySelector<HTMLInputElement>('#txtFechaFinal');
      if (fechaInicial && fechaFinal) {
        fechaInicial.value = inicio;
        fechaFinal.value = fin;
      }
    }, startDateStr, endDateStr);

    // Hacer clic en el botón consultar
    await page.click('#btnConsultar');
    console.log('Botón consultar clickeado');

    // Esperar a que los datos se carguen
    await page.waitForSelector('#dgDemanda', { timeout: 10000 });
    await page.waitForFunction(() => {
      const rows = document.querySelectorAll('#dgDemanda tr');
      return rows.length > 1;
    }, { timeout: 10000 });

    // Obtener los datos de la tabla
    const tableData = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('#dgDemanda tr'));
      return rows.slice(1).map(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        const fechaStr = cells[0]?.innerText?.trim() || '';
        const programado = cells[1]?.innerText ? parseFloat(cells[1].innerText.replace(',', '.')) : null;
        const ejecutado = cells[2]?.innerText ? parseFloat(cells[2].innerText.replace(',', '.')) : null;

        // Parsear la fecha correctamente
        const [fecha, hora] = fechaStr.split(' ');
        const [dia, mes, año] = fecha.split('/');
        const [hh, mm] = hora.split(':');
        
        const fechaObj = new Date(
          parseInt(año),
          parseInt(mes) - 1,
          parseInt(dia),
          parseInt(hh),
          parseInt(mm)
        );

        return {
          fecha: fechaObj.toISOString(),
          reprogramacion_diaria: programado,
          ejecutado: ejecutado
        };
      });
    });

    if (!tableData.length) {
      throw new Error('No se encontraron datos en la tabla');
    }

    console.log('Datos extraídos:', tableData.slice(0, 3));
    return tableData;

  } catch (error) {
    console.error('Error en la extracción de datos:', error);
    throw error;
  } finally {
    await browser.close();
  }
};
