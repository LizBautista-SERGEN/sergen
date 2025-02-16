
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileText, FileSpreadsheet } from "lucide-react";
import { exportToExcel, exportToPDF } from "@/utils/exportUtils";
import { ReactNode } from "react";

interface ExportDataDialogProps {
  data: any[];
  filename: string;
  chartComponent?: ReactNode;
}

export function ExportDataDialog({ data, filename, chartComponent }: ExportDataDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Exportar</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Exportar datos</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button
            variant="outline"
            className="w-full h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => exportToPDF(data, filename, chartComponent)}
          >
            <FileText className="h-8 w-8" />
            PDF
          </Button>
          <Button
            variant="outline"
            className="w-full h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => exportToExcel(data, filename)}
          >
            <FileSpreadsheet className="h-8 w-8" />
            Excel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
