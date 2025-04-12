
import { format, getDaysInMonth, parseISO, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";

interface ModulationDay {
  date: string;
  is_modulated: boolean;
}

interface ModulationTableProps {
  selectedMonth: Date;
  modulationData: ModulationDay[];
  isLoading: boolean;
  isDateInFuture: (date: Date) => boolean;
  onToggleModulation: (date: Date, currentValue: boolean) => void;
}

export const ModulationTable = ({
  selectedMonth,
  modulationData,
  isLoading,
  isDateInFuture,
  onToggleModulation
}: ModulationTableProps) => {
  // Generate days for the selected month
  const generateDaysForMonth = () => {
    const daysInMonth = getDaysInMonth(selectedMonth);
    const startDay = startOfMonth(selectedMonth);
    const days: Date[] = [];

    for (let i = 0; i < daysInMonth; i++) {
      const day = new Date(startDay);
      day.setDate(day.getDate() + i);
      days.push(day);
    }

    return days.filter(day => !isDateInFuture(day));
  };

  // Get modulation status for a specific date
  const getModulationStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return modulationData.find(day => day.date === dateStr)?.is_modulated || false;
  };

  const daysToDisplay = generateDaysForMonth();

  return (
    <div className="overflow-x-auto bg-white p-4 rounded-lg border shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Tabla de Modulación - {format(selectedMonth, 'MMMM yyyy', { locale: es })}</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Modulación</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center">
                Cargando datos...
              </TableCell>
            </TableRow>
          ) : daysToDisplay.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center">
                No hay días disponibles para este mes
              </TableCell>
            </TableRow>
          ) : (
            daysToDisplay.map((day) => {
              const isModulated = getModulationStatus(day);
              
              return (
                <TableRow key={format(day, 'yyyy-MM-dd')} className={isModulated ? "bg-red-50" : "bg-green-50"}>
                  <TableCell>{format(day, 'dd/MM/yyyy', { locale: es })}</TableCell>
                  <TableCell>
                    <span className={isModulated ? "text-red-500 font-medium" : "text-green-500 font-medium"}>
                      {isModulated ? "Modulado" : "No Modulado"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">No Modulado</span>
                      <Switch
                        checked={isModulated}
                        onCheckedChange={() => {
                          onToggleModulation(day, isModulated);
                        }}
                      />
                      <span className="text-sm text-gray-500">Modulado</span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
