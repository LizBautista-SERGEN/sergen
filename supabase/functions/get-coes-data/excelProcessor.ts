
import { read, utils } from "https://esm.sh/xlsx@0.18.5";
import { parseNumber } from './utils.ts';

export interface ProcessedData {
  Fecha: string;
  Demanda: number | null;
  Reserva: number | null;
  "Potencia Efectiva": number | null;
  "Prog. Diaria": number | null;
  "Prog. Semanal": number | null;
  "Margen Reserva": number | null;
}

export const processExcelData = async (arrayBuffer: ArrayBuffer): Promise<ProcessedData[]> => {
  try {
    console.log('Iniciando procesamiento del archivo Excel');
    
    const workbook = read(new Uint8Array(arrayBuffer), { 
      type: 'array',
      cellDates: true,
      cellNF: false,
      cellText: false
    });

    console.log('Hojas disponibles:', workbook.SheetNames);

    if (!workbook.SheetNames.length) {
      throw new Error('El archivo Excel no contiene hojas');
    }

    // Usar la primera hoja
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Convertir a JSON con opciones más flexibles
    const jsonData = utils.sheet_to_json(worksheet, {
      raw: false,
      dateNF: 'yyyy-mm-dd HH:mm:ss',
      defval: null,
      blankrows: false
    });

    console.log('Datos crudos del Excel:', jsonData.slice(0, 2));

    if (!Array.isArray(jsonData) || jsonData.length === 0) {
      throw new Error('No se encontraron datos en el archivo Excel');
    }

    // Procesar los datos con manejo más flexible
    const processedData = jsonData.map((row: any) => {
      // Intentar encontrar las columnas por diferentes nombres posibles
      const fecha = row['Fecha'] || row['fecha'] || row['FECHA'];
      const demanda = row['Demanda'] || row['demanda'] || row['DEMANDA'];
      const reserva = row['Reserva'] || row['reserva'] || row['RESERVA'];
      const potenciaEfectiva = row['Potencia Efectiva'] || row['potencia efectiva'] || row['POTENCIA EFECTIVA'];
      const progDiaria = row['Prog. Diaria'] || row['prog. diaria'] || row['PROG. DIARIA'];
      const progSemanal = row['Prog. Semanal'] || row['prog. semanal'] || row['PROG. SEMANAL'];
      const margenReserva = row['Margen Reserva'] || row['margen reserva'] || row['MARGEN RESERVA'];

      if (!fecha) {
        console.log('Fila sin fecha encontrada:', row);
        return null;
      }

      return {
        Fecha: fecha,
        Demanda: demanda !== undefined ? parseNumber(demanda) : null,
        Reserva: reserva !== undefined ? parseNumber(reserva) : null,
        "Potencia Efectiva": potenciaEfectiva !== undefined ? parseNumber(potenciaEfectiva) : null,
        "Prog. Diaria": progDiaria !== undefined ? parseNumber(progDiaria) : null,
        "Prog. Semanal": progSemanal !== undefined ? parseNumber(progSemanal) : null,
        "Margen Reserva": margenReserva !== undefined ? parseNumber(margenReserva) : null
      };
    }).filter((item): item is ProcessedData => item !== null);

    if (processedData.length === 0) {
      throw new Error('No se encontraron datos válidos en el archivo Excel');
    }

    console.log('Datos procesados exitosamente. Total de registros:', processedData.length);
    console.log('Muestra de datos procesados:', processedData.slice(0, 2));

    return processedData;
  } catch (error) {
    console.error('Error procesando Excel:', error);
    throw error;
  }
};
