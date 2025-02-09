
import { FileText, ChartBar, LineChart, Database, Home, Download, Plus, Save } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import html2pdf from 'html2pdf.js';
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const reportSections = [
  {
    title: "PORTADA",
    icon: <Home className="h-5 w-5" />,
  },
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

interface Template {
  id: string;
  name: string;
  content: any;
}

const InformesPage = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const { data: templates, error } = await supabase
      .from('report_templates')
      .select('*');

    if (error) {
      toast.error("Error al cargar las plantillas");
      return;
    }

    if (templates) {
      setTemplates(templates);
      if (templates.length > 0 && !selectedTemplate) {
        setSelectedTemplate(templates[0]);
      }
    }
  };

  const handleDownloadPDF = () => {
    const content = document.getElementById('report-content');
    if (!content) {
      toast.error("Error al generar el PDF");
      return;
    }

    const opt = {
      margin: 1,
      filename: 'informe-gestion-energetica.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(content).save().then(() => {
      toast.success("PDF descargado exitosamente");
    }).catch(() => {
      toast.error("Error al descargar el PDF");
    });
  };

  const saveAsTemplate = async () => {
    if (!newTemplateName.trim()) {
      toast.error("Por favor ingrese un nombre para la plantilla");
      return;
    }

    const content = document.getElementById('report-content');
    if (!content) {
      toast.error("Error al guardar la plantilla");
      return;
    }

    const templateContent = {
      html: content.innerHTML
    };

    const { error } = await supabase
      .from('report_templates')
      .insert({
        name: newTemplateName,
        content: templateContent
      });

    if (error) {
      toast.error("Error al guardar la plantilla");
      return;
    }

    toast.success("Plantilla guardada exitosamente");
    setNewTemplateName("");
    setIsDialogOpen(false);
    loadTemplates();
  };

  const loadTemplate = (template: Template) => {
    setSelectedTemplate(template);
    const content = document.getElementById('report-content');
    if (content && template.content.html) {
      content.innerHTML = template.content.html;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex w-full">
        <DashboardSidebar />
        <div className="flex-1 ml-[80px] hover:ml-[300px] transition-all duration-300">
          <div className="container mx-auto px-4 pt-24 pb-8">
            <div className="grid grid-cols-12 gap-6">
              {/* Left Sidebar */}
              <div className="col-span-3">
                <Card className="p-4 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-semibold">Plantillas</h2>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Nueva
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Guardar como plantilla</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="name">Nombre de la plantilla</Label>
                            <Input
                              id="name"
                              value={newTemplateName}
                              onChange={(e) => setNewTemplateName(e.target.value)}
                              placeholder="Ej: Informe Mensual"
                            />
                          </div>
                        </div>
                        <Button onClick={saveAsTemplate}>Guardar plantilla</Button>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {templates.map((template) => (
                        <Button
                          key={template.id}
                          variant={selectedTemplate?.id === template.id ? "default" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => loadTemplate(template)}
                        >
                          {template.name}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </Card>

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
                    <div className="space-x-2">
                      <Button onClick={handleDownloadPDF}>
                        <Download className="mr-2 h-4 w-4" />
                        Descargar PDF
                      </Button>
                    </div>
                  </div>
                  <ScrollArea className="h-[700px] border rounded-lg p-4">
                    <div id="report-content" className="space-y-8">
                      {/* Portada */}
                      <div className="text-center mb-16">
                        <img 
                          src="/public/og-image.png" 
                          alt="Logo" 
                          className="mx-auto mb-8 h-24"
                        />
                        <h1 className="text-3xl font-bold mb-4">Informe de Gestión Energética</h1>
                        <h2 className="text-xl mb-2">[Nombre de la Empresa]</h2>
                        <p className="text-gray-600">[Fecha del Informe]</p>
                      </div>

                      <div className="prose max-w-none">
                        <h3>TARIFA ACTUALIZADA</h3>
                        <p className="text-gray-600">
                          [Aquí va el contenido de la sección de tarifa actualizada...]
                        </p>

                        <h3>POTENCIA COINCIDENTE</h3>
                        <p className="text-gray-600">
                          [Aquí va el contenido de la sección de potencia coincidente...]
                        </p>

                        <h3>MODULACIONES</h3>
                        <p className="text-gray-600">
                          [Aquí va el contenido de la sección de modulaciones...]
                        </p>

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
