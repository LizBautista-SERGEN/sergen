
import { Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReportDateSelectorProps {
  availableYears: string[];
  availableMonths: string[];
  selectedYear: string | null;
  selectedMonth: string | null;
  onYearChange: (year: string) => void;
  onMonthChange: (month: string) => void;
}

export const ReportDateSelector = ({
  availableYears,
  availableMonths,
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange
}: ReportDateSelectorProps) => {

  // Spanish month name mapping (for display purposes)
  const getMonthName = (month: string) => {
    return month; // Month names are already in Spanish in the filenames
  };

  return (
    <Card className="p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold">Seleccionar Fecha</h2>
        <Calendar className="h-5 w-5 text-gray-500" />
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Año</label>
          <Select
            value={selectedYear || ""}
            onValueChange={onYearChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(year => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Mes</label>
          <Select
            value={selectedMonth || ""}
            onValueChange={onMonthChange}
            disabled={!selectedYear || availableMonths.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              {availableMonths.map(month => (
                <SelectItem key={month} value={month}>
                  {getMonthName(month)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-4 text-center text-sm text-gray-600">
        {selectedYear && selectedMonth ? 
          `Reporte seleccionado: ${selectedMonth} ${selectedYear}` : 
          "Seleccione año y mes para filtrar reportes"}
      </div>
    </Card>
  );
};
