
const BASE_URL = 'https://www.coes.org.pe/Portal/portalinformacion';

export const searchData = async (date: string, cookies: string) => {
  const formData = new URLSearchParams();
  formData.append('txtFechaInicio', date);
  formData.append('txtFechaFin', date);

  const response = await fetch(`${BASE_URL}/BusquedaProTiempoReal`, {
    method: 'POST',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': '*/*',
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      'Origin': 'https://www.coes.org.pe',
      'Referer': `${BASE_URL}/demanda`,
      'Cookie': cookies,
    },
    body: formData.toString()
  });

  if (!response.ok) {
    throw new Error(`Error en la búsqueda: ${response.status}`);
  }

  return response;
};

export const downloadExcel = async (cookies: string) => {
  const response = await fetch(`${BASE_URL}/ExportarPronosticoTiempoReal`, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Referer': `${BASE_URL}/demanda`,
      'Cookie': cookies,
    }
  });

  if (!response.ok) {
    throw new Error(`Error en la descarga: ${response.status}`);
  }

  return response;
};
