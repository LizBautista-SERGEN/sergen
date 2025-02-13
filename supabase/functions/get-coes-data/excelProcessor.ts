
import { read, utils } from "https://esm.sh/xlsx@0.18.5";
import { parseNumber } from './utils.ts';

export interface ProcessedData {
  Fecha: string;
  "Reprogramación Diaria": number | null;
  "Pronóstico": number | null;
  "Rango Mínimo": number | null;
  "Rango Máximo": number | null;
  "Ejecutado": number | null;
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
      const reprogramacion = row['Reprogramación Diaria'] || row['REPROGRAMACIÓN DIARIA'];
      const pronostico = row['Pronóstico'] || row['PRONÓSTICO'];
      const rangoMin = row['Rango Mínimo'] || row['RANGO MÍNIMO'];
      const rangoMax = row['Rango Máximo'] || row['RANGO MÁXIMO'];
      const ejecutado = row['Ejecutado'] || row['EJECUTADO'];

      if (!fecha) {
        console.log('Fila sin fecha encontrada:', row);
        return null;
      }

      return {
        Fecha: fecha,
        "Reprogramación Diaria": reprogramacion !== undefined ? parseNumber(reprogramacion) : null,
        "Pronóstico": pronostico !== undefined ? parseNumber(pronostico) : null,
        "Rango Mínimo": rangoMin !== undefined ? parseNumber(rangoMin) : null,
        "Rango Máximo": rangoMax !== undefined ? parseNumber(rangoMax) : null,
        "Ejecutado": ejecutado !== undefined ? parseNumber(ejecutado) : null
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
