
import html2pdf from 'html2pdf.js';
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

export const generatePDF = (
  selectedDate: Date,
  hiddenSections: string[]
) => {
  const content = document.getElementById('report-content');
  if (!content) {
    toast.error("Error al generar el PDF");
    return;
  }

  const hiddenElements = content.querySelectorAll('[data-section]');
  const originalDisplay: { [key: string]: string } = {};
  
  hiddenElements.forEach((element: Element) => {
    const section = element.getAttribute('data-section');
    if (section && hiddenSections.includes(section)) {
      const htmlElement = element as HTMLElement;
      originalDisplay[section] = htmlElement.style.display;
      htmlElement.style.display = 'none';
    }
  });

  const opt = {
    margin: 0,
    filename: `informe-gestion-energetica-${format(selectedDate, 'MMMM-yyyy', { locale: es })}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(content).save().then(() => {
    hiddenElements.forEach((element: Element) => {
      const section = element.getAttribute('data-section');
      if (section && originalDisplay[section]) {
        (element as HTMLElement).style.display = originalDisplay[section];
      }
    });
    toast.success("PDF descargado exitosamente");
  }).catch(() => {
    toast.error("Error al descargar el PDF");
  });
};
