
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export const HistoricalTab = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Histórico</CardTitle>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Cargar Datos
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Aquí irá el contenido del histórico */}
          <div className="h-[400px]">
            {/* HistoricalChart irá aquí */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
