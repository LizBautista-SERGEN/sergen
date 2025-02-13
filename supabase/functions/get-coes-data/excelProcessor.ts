
import { read, utils } from "https://esm.sh/xlsx@0.18.5";
import { parseNumber } from './utils.ts';

export interface ProcessedData {
  Fecha: string;
  Ejecutado: number;
  "Prog. Diaria": number;
  "Prog. Semanal": number;
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

  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = utils.sheet_to_json(worksheet, {
    raw: true,
    dateNF: 'yyyy-mm-dd HH:mm:ss',
    header: 1,
    blankrows: false
  });

  if (!Array.isArray(jsonData) || jsonData.length === 0) {
    throw new Error('No se encontraron datos en el archivo Excel');
  }

  const headerRow = jsonData.find((row: any[]) => 
    Array.isArray(row) && row.some((cell: any) => 
      typeof cell === 'string' && 
      (cell.toLowerCase().includes('fecha') || 
       cell.toLowerCase().includes('ejecutado'))
    )
  );

  if (!headerRow) {
    throw new Error('No se encontró la fila de encabezados en el Excel');
  }

  const headerIndex = jsonData.indexOf(headerRow);
  const dataRows = jsonData.slice(headerIndex + 1);

  const processedData = dataRows
    .filter((row: any[]) => row && row.length >= 3)
    .map((row: any[]) => ({
      Fecha: row[0],
      Ejecutado: parseNumber(row[1]),
      "Prog. Diaria": parseNumber(row[2]),
      "Prog. Semanal": row.length > 3 ? parseNumber(row[3]) : 0
    }))
    .filter(data => data.Fecha && (data.Ejecutado > 0 || data["Prog. Diaria"] > 0));

  if (processedData.length === 0) {
    throw new Error('No se encontraron datos válidos en el archivo Excel');
  }

  return processedData;
};

