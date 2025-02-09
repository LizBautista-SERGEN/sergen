
import { FileText, ChartBar, LineChart, Database, Home, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const reportSections = [
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

interface ReportSectionsProps {
  hiddenSections: string[];
  onToggleSection: (sectionId: string) => void;
}

export const ReportSections = ({ hiddenSections, onToggleSection }: ReportSectionsProps) => {
  return (
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
              onClick={() => onToggleSection(section.id)}
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
  );
};
