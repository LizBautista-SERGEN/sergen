
import { saveAs } from 'file-saver';
import { utils, write } from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ReactNode } from 'react';
import html2canvas from 'html2canvas';

export const exportToExcel = (data: any[], filename: string) => {
  const ws = utils.json_to_sheet(data.map(item => ({
    Fecha: format(new Date(item.Fecha), 'dd/MM/yyyy HH:mm'),
    Programado: item['Reprogramación Diaria'],
    Pronóstico: item['Pronóstico'],
    'Rango Mínimo': item['Rango Mínimo'],
    'Rango Máximo': item['Rango Máximo'],
    Ejecutado: item['Ejecutado']
  })));

  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Datos');
  const excelBuffer = write(wb, { bookType: 'xlsx', type: 'array' });
  const data_blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
  saveAs(data_blob, `${filename}.xlsx`);
};

export const exportToPDF = async (data: any[], filename: string, chartComponent?: ReactNode) => {
  const doc = new jsPDF();
  
  // Si hay un componente de gráfico, añadirlo primero
  if (chartComponent) {
    const chart = document.createElement('div');
    chart.style.position = 'absolute';
    chart.style.left = '-9999px';
    document.body.appendChild(chart);
    
    // Renderizar el gráfico y capturarlo
    const canvas = await html2canvas(chart);
    const chartImage = canvas.toDataURL('image/png');
    
    // Añadir el gráfico al PDF
    doc.addImage(chartImage, 'PNG', 10, 10, 190, 100);
    
    // Limpiar
    document.body.removeChild(chart);
  }

  const tableColumn = ["Fecha", "Programado", "Pronóstico", "Rango Mínimo", "Rango Máximo", "Ejecutado"];
  const tableRows = data.map(item => [
    format(new Date(item.Fecha), 'dd/MM/yyyy HH:mm'),
    item['Reprogramación Diaria']?.toLocaleString() || '-',
    item['Pronóstico']?.toLocaleString() || '-',
    item['Rango Mínimo']?.toLocaleString() || '-',
    item['Rango Máximo']?.toLocaleString() || '-',
    item['Ejecutado']?.toLocaleString() || '-'
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: chartComponent ? 120 : 20,
    styles: { fontSize: 8, cellPadding: 1.5 },
    headStyles: { fillColor: [21, 96, 130] }
  });

  doc.save(`${filename}.pdf`);
};
