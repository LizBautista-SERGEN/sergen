import { FileText, ChartBar, LineChart, Database, Home, Download, Plus, Save, X, Eye, EyeOff, Calendar } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner";
import html2pdf from 'html2pdf.js';
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";

const reportSections = [
  {
    id: "portada",
    title: "PORTADA",
    icon: <Home className="h-5 w-5" />,
  },
  {
    id: "tarifa",
    title: "TARIFA ACTUALIZADA",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    id: "potencia",
    title: "POTENCIA COINCIDENTE",
    icon: <ChartBar className="h-5 w-5" />,
  },
  {
    id: "modulaciones",
    title: "MODULACIONES",
    icon: <LineChart className="h-5 w-5" />,
  },
  {
    id: "conclusiones",
    title: "CONCLUSIONES",
    icon: <Database className="h-5 w-5" />,
  }
];

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

    // First, try to get existing report number
    const { data: existingReport, error: fetchError } = await supabase
      .from('report_numbers')
      .select('report_number')
      .eq('user_id', session.user.id)
      .eq('year', year)
      .eq('month', month)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      toast.error("Error al obtener el número de informe");
      return;
    }

    if (existingReport) {
      setReportNumber(existingReport.report_number);
      return;
    }

    // If no report exists for this month, get the last report number
    const { data: lastReport, error: lastReportError } = await supabase
      .from('report_numbers')
      .select('report_number')
      .eq('user_id', session.user.id)
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .limit(1)
      .single();

    const newReportNumber = (lastReport?.report_number || 0) + 1;

    // Insert new report number
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

  const years = Array.from({ length: 11 }, (_, i) => 2020 + i);
  const months = Array.from({ length: 12 }, (_, i) => i);

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
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex w-full">
        <DashboardSidebar />
        <div className="flex-1 ml-[80px] hover:ml-[300px] transition-all duration-300">
          <div className="container mx-auto px-4 pt-24 pb-8">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-3">
                <Card className="p-4 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-semibold">Seleccionar Fecha</h2>
                    <Calendar className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Año</label>
                      <Select
                        value={selectedDate.getFullYear().toString()}
                        onValueChange={handleYearChange}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map(year => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Mes</label>
                      <Select
                        value={selectedDate.getMonth().toString()}
                        onValueChange={handleMonthChange}
                      >
                        <SelectTrigger>
                          <SelectValue>
                            {format(selectedDate, 'MMMM', { locale: es })}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {months.map(month => (
                            <SelectItem key={month} value={month.toString()}>
                              {format(new Date(2024, month, 1), 'MMMM', { locale: es })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-4 text-center text-sm text-gray-600">
                    Informe seleccionado: {format(selectedDate, 'MMMM yyyy', { locale: es })}
                  </div>
                </Card>

                <Card className="p-4">
                  <h2 className="font-semibold mb-4">Secciones del Informe</h2>
                  <div className="space-y-2">
                    {reportSections.map((section) => (
                      <div key={section.id} className="flex items-center justify-between">
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-2"
                        >
                          {section.icon}
                          {section.title}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSection(section.id)}
                        >
                          {hiddenSections.includes(section.id) ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
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
                              {profile?.business_name || 'Cargando...'}
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

                      <div 
                        data-section="tarifa" 
                        className={hiddenSections.includes('tarifa') ? 'opacity-50' : ''}
                        style={pageStyle}
                      >
                        <h3>TARIFA ACTUALIZADA</h3>
                        <p className="text-gray-600">
                          [Aquí va el contenido de la sección de tarifa actualizada...]
                        </p>
                      </div>

                      <div 
                        data-section="potencia" 
                        className={hiddenSections.includes('potencia') ? 'opacity-50' : ''}
                        style={pageStyle}
                      >
                        <h3>POTENCIA COINCIDENTE</h3>
                        <p className="text-gray-600">
                          [Aquí va el contenido de la sección de potencia coincidente...]
                        </p>
                      </div>

                      <div 
                        data-section="modulaciones" 
                        className={hiddenSections.includes('modulaciones') ? 'opacity-50' : ''}
                        style={pageStyle}
                      >
                        <h3>MODULACIONES</h3>
                        <p className="text-gray-600">
                          [Aquí va el contenido de la sección de modulaciones...]
                        </p>
                      </div>

                      <div 
                        data-section="conclusiones" 
                        className={hiddenSections.includes('conclusiones') ? 'opacity-50' : ''}
                        style={pageStyle}
                      >
                        <h3>CONCLUSIONES</h3>
                        <p className="text-gray-600">
                          [Aquí va el contenido de la sección de conclusiones...]
                        </p>
                      </div>
                    </div>
                  </ScrollArea>
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
