
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
  const workbook = read(new Uint8Array(arrayBuffer), { 
    type: 'array',
    cellDates: true,
    cellNF: false,
    cellText: false
  });

  if (!workbook.SheetNames.length) {
    throw new Error('El archivo Excel no contiene hojas');
  }

  // Usar la primera hoja
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  
  // Convertir a JSON manteniendo el orden original
  const jsonData = utils.sheet_to_json(worksheet, {
    raw: true,
    dateNF: 'yyyy-mm-dd HH:mm:ss',
    header: 1,
    blankrows: false
  });

  if (!Array.isArray(jsonData) || jsonData.length === 0) {
    throw new Error('No se encontraron datos en el archivo Excel');
  }

  // Encontrar la fila de encabezados
  const headerRow = jsonData.find((row: any[]) => 
    Array.isArray(row) && row.some((cell: any) => 
      typeof cell === 'string' && 
      cell.toLowerCase().includes('fecha')
    )
  );

  if (!headerRow) {
    throw new Error('No se encontró la fila de encabezados en el Excel');
  }

  const headerIndex = jsonData.indexOf(headerRow);
  const dataRows = jsonData.slice(headerIndex + 1);

  // Procesar los datos manteniendo el orden original
  const processedData = dataRows
    .filter((row: any[]) => row && row.length >= 7) // Asegurar que la fila tenga todas las columnas
    .map((row: any[]) => {
      const data = {
        Fecha: row[0],
        Demanda: row[1] !== undefined && row[1] !== null ? parseNumber(row[1]) : null,
        Reserva: row[2] !== undefined && row[2] !== null ? parseNumber(row[2]) : null,
        "Potencia Efectiva": row[3] !== undefined && row[3] !== null ? parseNumber(row[3]) : null,
        "Prog. Diaria": row[4] !== undefined && row[4] !== null ? parseNumber(row[4]) : null,
        "Prog. Semanal": row[5] !== undefined && row[5] !== null ? parseNumber(row[5]) : null,
        "Margen Reserva": row[6] !== undefined && row[6] !== null ? parseNumber(row[6]) : null
      };
      return data;
    });

  if (processedData.length === 0) {
    throw new Error('No se encontraron datos válidos en el archivo Excel');
  }

  console.log('Primeros registros procesados:', processedData.slice(0, 2));
  return processedData;
};
