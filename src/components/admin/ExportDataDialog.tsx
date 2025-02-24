
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { exportToExcel, exportToPDF } from "@/utils/exportUtils";
import { Download } from "lucide-react";
import { ReactNode, useState } from "react";

interface ExportDataDialogProps {
  data: any[];
  filename: string;
  chartComponent?: ReactNode;
}

export const ExportDataDialog = ({ data, filename, chartComponent }: ExportDataDialogProps) => {
  const [open, setOpen] = useState(false);

  const handleExportExcel = () => {
    exportToExcel(data, filename);
    setOpen(false);
  };

  const handleExportPDF = () => {
    exportToPDF(data, filename, chartComponent);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            onClick={handleExportExcel}
          >
            Exportar a Excel
          </Button>
          <Button
            variant="outline"
            onClick={handleExportPDF}
          >
            Exportar a PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
