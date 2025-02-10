
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { reportSections } from "./ReportSections";

interface ReportContentProps {
  selectedDate: Date;
  hiddenSections: string[];
  template: any;
  profile: any;
  reportNumber: number | null;
}

export const ReportContent = ({
  selectedDate,
  hiddenSections,
  template,
  profile,
  reportNumber
}: ReportContentProps) => {
  const pageStyle = {
    width: '210mm',
    minHeight: '297mm',
    margin: '0 auto',
    padding: '20mm',
    backgroundColor: 'white',
    boxSizing: 'border-box' as const,
    pageBreakAfter: 'always' as const,
  };

  return (
    <ScrollArea className="h-[700px] border rounded-lg p-4">
      <div id="report-content" className="space-y-8">
        <div 
          data-section="portada" 
          className={`relative flex flex-col items-center justify-between ${
            hiddenSections.includes('portada') ? 'opacity-50' : ''
          }`}
          style={pageStyle}
        >
          <div className="flex flex-col items-center w-full">
            <img 
              src="/lovable-uploads/947a546b-d4b6-48e2-affc-ad0488c7d420.png"
              alt="Sergen Logo" 
              className="h-32 mb-40"
            />
            <div className="space-y-10 text-center">
              <h1 className="text-4xl font-bold tracking-wider uppercase">
                {template?.name || 'INFORME DE GESTIÓN ENERGÉTICA'}
              </h1>
              <h2 className="text-3xl font-semibold uppercase">
                {profile?.business_name || 'ULTRAFRIO S.A.C.'}
              </h2>
              <p className="text-2xl uppercase">
                INF-{reportNumber?.toString().padStart(3, '0') || '000'}-{format(selectedDate, 'MM-yyyy')}
              </p>
            </div>
          </div>
          <div className="absolute bottom-[30mm] left-0 right-0 text-center">
            <p className="text-2xl uppercase">{format(selectedDate, 'MMMM yyyy', { locale: es }).toUpperCase()}</p>
          </div>
        </div>

        {reportSections.slice(1).map(section => (
          <div 
            key={section.id}
            data-section={section.id} 
            className={hiddenSections.includes(section.id) ? 'opacity-50' : ''}
            style={pageStyle}
          >
            <h3>{section.title}</h3>
            <p className="text-gray-600">
              [Aquí va el contenido de la sección de {section.title.toLowerCase()}...]
            </p>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
