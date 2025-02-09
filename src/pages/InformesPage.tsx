import { FileText, ChartBar, LineChart, Database, Home, Download, Plus, Save, X, Eye, EyeOff, Calendar } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import html2pdf from 'html2pdf.js';
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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

  useEffect(() => {
    checkUserRole();
  }, []);

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
      margin: 1,
      filename: `informe-gestion-energetica-${format(selectedDate, 'MMMM-yyyy', { locale: es })}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
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
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border"
                    locale={es}
                    showOutsideDays={false}
                  />
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
                      <div data-section="portada" className={`text-center mb-16 ${hiddenSections.includes('portada') ? 'opacity-50' : ''}`}>
                        <img 
                          src="/public/og-image.png" 
                          alt="Logo" 
                          className="mx-auto mb-8 h-24"
                        />
                        <h1 className="text-3xl font-bold mb-4">Informe de Gestión Energética</h1>
                        <h2 className="text-xl mb-2">[Nombre de la Empresa]</h2>
                        <p className="text-gray-600">{format(selectedDate, 'MMMM yyyy', { locale: es })}</p>
                      </div>

                      <div className="prose max-w-none">
                        <div data-section="tarifa" className={hiddenSections.includes('tarifa') ? 'opacity-50' : ''}>
                          <h3>TARIFA ACTUALIZADA</h3>
                          <p className="text-gray-600">
                            [Aquí va el contenido de la sección de tarifa actualizada...]
                          </p>
                        </div>

                        <div data-section="potencia" className={hiddenSections.includes('potencia') ? 'opacity-50' : ''}>
                          <h3>POTENCIA COINCIDENTE</h3>
                          <p className="text-gray-600">
                            [Aquí va el contenido de la sección de potencia coincidente...]
                          </p>
                        </div>

                        <div data-section="modulaciones" className={hiddenSections.includes('modulaciones') ? 'opacity-50' : ''}>
                          <h3>MODULACIONES</h3>
                          <p className="text-gray-600">
                            [Aquí va el contenido de la sección de modulaciones...]
                          </p>
                        </div>

                        <div data-section="conclusiones" className={hiddenSections.includes('conclusiones') ? 'opacity-50' : ''}>
                          <h3>CONCLUSIONES</h3>
                          <p className="text-gray-600">
                            [Aquí va el contenido de la sección de conclusiones...]
                          </p>
                        </div>
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
