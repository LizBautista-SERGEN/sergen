
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

    if (!workbook.SheetNames.length) {
      throw new Error('El archivo Excel no contiene hojas');
    }

    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    
    const jsonData = utils.sheet_to_json(worksheet, {
      raw: false,
      dateNF: 'yyyy-mm-dd HH:mm:ss',
      defval: null,
      blankrows: false
    });

    if (!Array.isArray(jsonData) || jsonData.length === 0) {
      throw new Error('No se encontraron datos en el archivo Excel');
    }

    // Procesar los datos en el orden original
    const processedData = jsonData.map((row: any) => {
      const fecha = row['Fecha'] || row['fecha'] || row['FECHA'];
      const reprogramacion = row['Reprogramación Diaria'] || row['REPROGRAMACIÓN DIARIA'];
      const pronostico = row['Pronóstico de Demanda Automático de Tiempo Real'] || 
                        row['PRONÓSTICO DE DEMANDA AUTOMÁTICO DE TIEMPO REAL'] ||
                        row['Pronóstico de Demanda Automatico de Tiempo Real'];
      const rangoMin = row['Rango Mínimo del Pronóstico de Demanda Automático de Tiempo Real'] || 
                      row['RANGO MÍNIMO DEL PRONÓSTICO DE DEMANDA AUTOMÁTICO DE TIEMPO REAL'];
      const rangoMax = row['Rango Máximo del Pronóstico de Demanda Automático de Tiempo Real'] || 
                      row['RANGO MÁXIMO DEL PRONÓSTICO DE DEMANDA AUTOMÁTICO DE TIEMPO REAL'];
      const ejecutado = row['Ejecutado'] || row['EJECUTADO'];

      if (!fecha) {
        console.log('Fila sin fecha encontrada:', row);
        return null;
      }

      // Procesar valores numéricos
      const processValue = (value: any): number | null => {
        if (!value) return null;
        const processed = parseNumber(value);
        return processed === 0 ? null : processed;
      };

      return {
        Fecha: fecha,
        "Reprogramación Diaria": processValue(reprogramacion),
        "Pronóstico": processValue(pronostico),
        "Rango Mínimo": processValue(rangoMin),
        "Rango Máximo": processValue(rangoMax),
        "Ejecutado": processValue(ejecutado)
      };
    }).filter((item): item is ProcessedData => item !== null);

    // Verificar si hay datos ejecutados
    const hasExecutedData = processedData.some(item => item.Ejecutado !== null);
    console.log('¿Hay datos ejecutados?:', hasExecutedData);

    let finalData = processedData;

    if (hasExecutedData) {
      // Encontrar el último dato ejecutado solo si hay datos ejecutados
      let lastExecutedIndex = processedData.length - 1;
      for (let i = processedData.length - 1; i >= 0; i--) {
        if (processedData[i].Ejecutado !== null) {
          lastExecutedIndex = i;
          break;
        }
      }

      console.log('Índice del último dato ejecutado:', lastExecutedIndex);

      // Aplicar el filtrado solo si hay datos ejecutados
      finalData = processedData.map((item, index) => {
        if (index < lastExecutedIndex) {
          return {
            ...item,
            "Pronóstico": null,
            "Rango Mínimo": null,
            "Rango Máximo": null
          };
        }
        return item;
      });
    } else {
      console.log('No hay datos ejecutados, mostrando todos los pronósticos');
    }

    if (finalData.length === 0) {
      throw new Error('No se encontraron datos válidos en el archivo Excel');
    }

    console.log('Datos procesados exitosamente. Total de registros:', finalData.length);
    return finalData;
  } catch (error) {
    console.error('Error procesando Excel:', error);
    throw error;
  }
};
