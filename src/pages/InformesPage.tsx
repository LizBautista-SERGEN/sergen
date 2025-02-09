
import { FileText, ChartBar, LineChart, Database } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

const reportSections = [
  {
    title: "TARIFA ACTUALIZADA",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: "POTENCIA COINCIDENTE",
    icon: <ChartBar className="h-5 w-5" />,
  },
  {
    title: "MODULACIONES",
    icon: <LineChart className="h-5 w-5" />,
  },
  {
    title: "CONCLUSIONES",
    icon: <Database className="h-5 w-5" />,
  }
];

const InformesPage = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex w-full">
        <DashboardSidebar />
        <div className="flex-1 ml-[80px] hover:ml-[300px] transition-all duration-300">
          <div className="container mx-auto px-4 pt-24 pb-8">
            <div className="grid grid-cols-12 gap-6">
              {/* Left Sidebar */}
              <div className="col-span-3">
                <Card className="p-4">
                  <h2 className="font-semibold mb-4">Secciones del Informe</h2>
                  <div className="space-y-2">
                    {reportSections.map((section, idx) => (
                      <Button
                        key={idx}
                        variant="ghost"
                        className="w-full justify-start gap-2"
                      >
                        {section.icon}
                        {section.title}
                      </Button>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Preview Area */}
              <div className="col-span-9">
                <Card className="p-4 h-[800px]">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-semibold">Vista Previa del Informe</h2>
                    <Button>Descargar PDF</Button>
                  </div>
                  <ScrollArea className="h-[700px] border rounded-lg p-4">
                    <div className="space-y-8">
                      <div className="text-center">
                        <h1 className="text-2xl font-bold mb-2">Informe de gestión energética</h1>
                        <h2 className="text-xl">Empresa S.A.</h2>
                      </div>
                      <div className="prose max-w-none">
                        <h3>TARIFA ACTUALIZADA</h3>
                        <p className="text-gray-600">
                          Contenido de la sección de tarifa actualizada...
                        </p>

                        <h3>POTENCIA COINCIDENTE</h3>
                        <p className="text-gray-600">
                          Contenido de la sección de potencia coincidente...
                        </p>

                        <h3>MODULACIONES</h3>
                        <p className="text-gray-600">
                          Contenido de la sección de modulaciones...
                        </p>

                        <h3>CONCLUSIONES</h3>
                        <p className="text-gray-600">
                          Contenido de la sección de conclusiones...
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
