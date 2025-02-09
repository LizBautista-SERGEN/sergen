
import { Download } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import html2pdf from 'html2pdf.js';
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { ReportDateSelector } from "@/components/reports/ReportDateSelector";
import { ReportSections } from "@/components/reports/ReportSections";
import { ReportContent } from "@/components/reports/ReportContent";

const InformesPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [hiddenSections, setHiddenSections] = useState<string[]>([]);
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [reportNumber, setReportNumber] = useState<number | null>(null);
  const [profile, setProfile] = useState<any>(null);

  const { data: template } = useQuery({
    queryKey: ['reportTemplate'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('report_templates')
        .select('*')
        .single();
      
      if (error) {
        toast.error("Error al cargar la plantilla del informe");
        throw error;
      }
      return data;
    }
  });

  useEffect(() => {
    checkUserRole();
    fetchProfile();
  }, []);

  useEffect(() => {
    fetchReportNumber();
  }, [selectedDate]);

  const checkUserRole = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      setIsSuperUser(profile?.role === 'superuser');
    }
  };

  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        toast.error("Error al cargar la información del perfil");
        return;
      }

      setProfile(data);
    }
  };

  const fetchReportNumber = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;

    const { data: existingReport, error: fetchError } = await supabase
      .from('report_numbers')
      .select('report_number')
      .eq('user_id', session.user.id)
      .eq('year', year)
      .eq('month', month)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      toast.error("Error al obtener el número de informe");
      return;
    }

    if (existingReport) {
      setReportNumber(existingReport.report_number);
      return;
    }

    const { data: lastReport, error: lastReportError } = await supabase
      .from('report_numbers')
      .select('report_number')
      .eq('user_id', session.user.id)
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .limit(1)
      .single();

    const newReportNumber = (lastReport?.report_number || 0) + 1;

    const { error: insertError } = await supabase
      .from('report_numbers')
      .insert({
        user_id: session.user.id,
        year,
        month,
        report_number: newReportNumber
      });

    if (insertError) {
      toast.error("Error al generar el número de informe");
      return;
    }

    setReportNumber(newReportNumber);
  };

  const handleDownloadPDF = () => {
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
