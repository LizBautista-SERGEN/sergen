
import { saveAs } from 'file-saver';
import { utils, write } from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ReactNode } from 'react';
import html2canvas from 'html2canvas';
import ReactDOMServer from 'react-dom/server';

export const exportToExcel = (data: any[], filename: string) => {
  // Asegurarse de que los datos estén ordenados por fecha
  const sortedData = [...data].sort((a, b) => 
    new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  );

  const excelData = sortedData.map(item => ({
    Fecha: format(new Date(item.fecha), 'dd/MM/yyyy HH:mm:ss'),
    'Reprogramación': item.reprogramacion || '',
    'Pronóstico Diario': item.pronostico_diario || '',
    'Rango Inferior': item.rango_inferior || '',
    'Rango Superior': item.rango_superior || '',
    'Demanda Real': item.demanda_real || ''
  }));

  const ws = utils.json_to_sheet(excelData);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Datos');
  
  // Ajustar el ancho de las columnas
  const wscols = [
    {wch: 20}, // Fecha
    {wch: 15}, // Reprogramación
    {wch: 15}, // Pronóstico Diario
    {wch: 15}, // Rango Inferior
    {wch: 15}, // Rango Superior
    {wch: 15}  // Demanda Real
  ];
  ws['!cols'] = wscols;

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

  // Ordenar los datos por fecha
  const sortedData = [...data].sort((a, b) => 
    new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  );

  const tableColumn = ["Fecha", "Reprogramación", "Pronóstico Diario", "Rango Inferior", "Rango Superior", "Demanda Real"];
  const tableRows = sortedData.map(item => [
    format(new Date(item.fecha), 'dd/MM/yyyy HH:mm:ss'),
    item.reprogramacion?.toLocaleString() || '-',
    item.pronostico_diario?.toLocaleString() || '-',
    item.rango_inferior?.toLocaleString() || '-',
    item.rango_superior?.toLocaleString() || '-',
    item.demanda_real?.toLocaleString() || '-'
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
