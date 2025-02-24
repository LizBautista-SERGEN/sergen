
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

export const ModulationTab = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Modulación</CardTitle>
        <Button variant="outline">
          <Calendar className="mr-2 h-4 w-4" />
          Seleccionar Fecha
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Aquí irá el contenido de modulación */}
          <div className="h-[400px]">
            {/* ModulationChart irá aquí */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
