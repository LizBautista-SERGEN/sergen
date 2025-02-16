
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { exportToExcel, exportToPDF } from "@/utils/exportUtils";
import { Download } from "lucide-react";
import { ReactNode } from "react";

interface ExportDataDialogProps {
  data: any[];
  filename: string;
  chartComponent?: ReactNode;
}

export const ExportDataDialog = ({ data, filename, chartComponent }: ExportDataDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar datos</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-4">
          <Button
            variant="outline"
            onClick={() => exportToExcel(data, filename)}
          >
            Exportar a Excel
          </Button>
          <Button
            variant="outline"
            onClick={() => exportToPDF(data, filename, chartComponent)}
          >
            Exportar a PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
