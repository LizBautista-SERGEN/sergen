
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReportDateSelectorProps {
  selectedDate: Date;
  onMonthChange: (month: string) => void;
  onYearChange: (year: string) => void;
}

export const ReportDateSelector = ({
  selectedDate,
  onMonthChange,
  onYearChange
}: ReportDateSelectorProps) => {
  const years = Array.from({ length: 11 }, (_, i) => 2020 + i);
  const months = Array.from({ length: 12 }, (_, i) => i);

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
            value={selectedDate.getFullYear().toString()}
            onValueChange={onYearChange}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Mes</label>
          <Select
            value={selectedDate.getMonth().toString()}
            onValueChange={onMonthChange}
          >
            <SelectTrigger>
              <SelectValue>
                {format(selectedDate, 'MMMM', { locale: es })}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {months.map(month => (
                <SelectItem key={month} value={month.toString()}>
                  {format(new Date(2024, month, 1), 'MMMM', { locale: es })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-4 text-center text-sm text-gray-600">
        Informe seleccionado: {format(selectedDate, 'MMMM yyyy', { locale: es })}
      </div>
    </Card>
  );
};
