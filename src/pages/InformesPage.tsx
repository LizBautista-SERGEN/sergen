
import { Download } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReportDateSelector } from "@/components/reports/ReportDateSelector";
import { ReportSections } from "@/components/reports/ReportSections";
import { ReportContent } from "@/components/reports/ReportContent";
import { useReportNumber } from "@/hooks/useReportNumber";
import { useUserProfile } from "@/hooks/useUserProfile";
import { generatePDF } from "@/utils/pdfUtils";
import { toast } from "sonner";

const InformesPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [hiddenSections, setHiddenSections] = useState<string[]>([]);
  const reportNumber = useReportNumber(selectedDate);
  const { profile } = useUserProfile();

  const { data: template } = useQuery({
    queryKey: ['reportTemplate'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('report_templates')
        .select('*')
        .maybeSingle();
      
      if (error) {
        toast.error("Error al cargar la plantilla del informe");
        throw error;
      }
      return data;
    }
  });

  const handleDownloadPDF = () => {
    generatePDF(selectedDate, hiddenSections);
  };

  const toggleSection = (sectionId: string) => {
    setHiddenSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleMonthChange = (month: string) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(parseInt(month));
    setSelectedDate(newDate);
  };

  const handleYearChange = (year: string) => {
    const newDate = new Date(selectedDate);
    newDate.setFullYear(parseInt(year));
    setSelectedDate(newDate);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex w-full">
        <DashboardSidebar />
        <div className="flex-1 ml-[80px] hover:ml-[300px] transition-all duration-300">
          <div className="container mx-auto px-4 pt-24 pb-8">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-3">
                <ReportDateSelector
                  selectedDate={selectedDate}
                  onMonthChange={handleMonthChange}
                  onYearChange={handleYearChange}
                />
                <ReportSections
                  hiddenSections={hiddenSections}
                  onToggleSection={toggleSection}
                />
              </div>

              <div className="col-span-9">
                <Card className="p-4 h-[800px]">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-semibold">Vista Previa del Informe</h2>
                    <div className="space-x-2">
                      <Button onClick={handleDownloadPDF}>
                        <Download className="mr-2 h-4 w-4" />
                        Descargar PDF
                      </Button>
                    </div>
                  </div>
                  <ReportContent
                    selectedDate={selectedDate}
                    hiddenSections={hiddenSections}
                    template={template}
                    profile={profile}
                    reportNumber={reportNumber}
                  />
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default InformesPage;
