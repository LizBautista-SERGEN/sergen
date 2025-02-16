
import { saveAs } from 'file-saver';
import { utils, write } from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ReactNode } from 'react';
import html2canvas from 'html2canvas';
import ReactDOMServer from 'react-dom/server';

export const exportToExcel = (data: any[], filename: string) => {
  const ws = utils.json_to_sheet(data.map(item => ({
    Fecha: format(new Date(item.fecha), 'dd/MM/yyyy HH:mm'),
    'Reprogramación Diaria': item.reprogramacion_diaria,
    'Pronóstico': item.pronostico,
    'Rango Mínimo': item.rango_minimo,
    'Rango Máximo': item.rango_maximo,
    'Ejecutado': item.ejecutado
  })));

  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Datos');
  const excelBuffer = write(wb, { bookType: 'xlsx', type: 'array' });
  const data_blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
  saveAs(data_blob, `${filename}.xlsx`);
};

export const exportToPDF = async (data: any[], filename: string, chartComponent?: ReactNode) => {
  const doc = new jsPDF();
  
  // Añadir título
  doc.setFontSize(16);
  doc.text('Pronóstico de Demanda', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
  
  // Si hay un componente de gráfico, añadirlo después del título
  if (chartComponent) {
    try {
      // Crear un contenedor temporal
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.width = '800px';
      container.style.height = '400px';
      document.body.appendChild(container);

      // Renderizar el componente React
      container.innerHTML = ReactDOMServer.renderToString(chartComponent as any);

      // Esperar a que el gráfico se renderice completamente
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Capturar el gráfico como imagen
      const canvas = await html2canvas(container, {
        logging: false,
        useCORS: true,
        allowTaint: true,
        scale: 2,
        backgroundColor: '#ffffff'
      });

      // Convertir el canvas a imagen
      const imgData = canvas.toDataURL('image/png');

      // Añadir la imagen al PDF después del título
      doc.addImage(imgData, 'PNG', 10, 25, 190, 100);

      // Limpiar
      document.body.removeChild(container);
    } catch (error) {
      console.error('Error al generar el gráfico:', error);
    }
  }

  const tableColumn = ["Fecha", "Programado", "Pronóstico", "Rango Mínimo", "Rango Máximo", "Ejecutado"];
  const tableRows = data.map(item => [
    format(new Date(item.fecha), 'dd/MM/yyyy HH:mm'),
    item.reprogramacion_diaria?.toLocaleString() || '-',
    item.pronostico?.toLocaleString() || '-',
    item.rango_minimo?.toLocaleString() || '-',
    item.rango_maximo?.toLocaleString() || '-',
    item.ejecutado?.toLocaleString() || '-'
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: chartComponent ? 135 : 25,
    styles: { fontSize: 8, cellPadding: 1.5 },
    headStyles: { fillColor: [21, 96, 130] }
  });

  doc.save(`${filename}.pdf`);
};
