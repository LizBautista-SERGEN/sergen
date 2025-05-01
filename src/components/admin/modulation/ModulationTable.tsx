import { format, getDaysInMonth, parseISO, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

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
  // State to track pending toggle changes
  const [pendingToggles, setPendingToggles] = useState<Record<string, boolean>>({});
  
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
    
    // Check if there's a pending toggle for this date
    if (dateStr in pendingToggles) {
      return pendingToggles[dateStr];
    }
    
    // Otherwise use the data from props
    return modulationData.find(day => day.date === dateStr)?.is_modulated || false;
  };

  const handleToggleModulation = (day: Date, currentValue: boolean) => {
    // Update local state immediately for UI responsiveness
    const dateStr = format(day, 'yyyy-MM-dd');
    setPendingToggles(prev => ({
      ...prev,
      [dateStr]: !currentValue
    }));
    
    // Call the parent handler
    onToggleModulation(day, currentValue);
    
    // Clear pending state after successful update
    setTimeout(() => {
      setPendingToggles(prev => {
        const newState = { ...prev };
        delete newState[dateStr];
        return newState;
      });
    }, 500);
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
              const dateStr = format(day, 'yyyy-MM-dd');
              const isPending = dateStr in pendingToggles;
              
              return (
                <TableRow key={dateStr} className={isModulated ? "bg-red-50" : "bg-green-50"}>
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
                          handleToggleModulation(day, isModulated);
                        }}
                        className={isPending ? "opacity-70" : ""}
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
