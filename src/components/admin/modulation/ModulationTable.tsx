
import { format, getDaysInMonth, parseISO, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState, useMemo } from "react";

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
  const [tableData, setTableData] = useState<ModulationDay[]>([]);
  
  // Update table data whenever modulationData changes
  useEffect(() => {
    if (modulationData.length > 0) {
      setTableData(modulationData);
    }
  }, [modulationData]);

  // Generate days for the selected month - memoize this calculation
  const daysToDisplay = useMemo(() => {
    const daysInMonth = getDaysInMonth(selectedMonth);
    const startDay = startOfMonth(selectedMonth);
    const days: Date[] = [];

    for (let i = 0; i < daysInMonth; i++) {
      const day = new Date(startDay);
      day.setDate(day.getDate() + i);
      days.push(day);
    }

    // Filter out future days
    return days.filter(day => !isDateInFuture(day));
  }, [selectedMonth, isDateInFuture]);

  // Get modulation status for a specific date
  const getModulationStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return tableData.find(day => day.date === dateStr)?.is_modulated || false;
  };

  const handleToggleModulation = (date: Date, currentValue: boolean) => {
    // Update local state immediately for responsive UI
    const dateStr = format(date, 'yyyy-MM-dd');
    setTableData(prev => {
      const existingIdx = prev.findIndex(day => day.date === dateStr);
      
      if (existingIdx >= 0) {
        // Update existing entry
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], is_modulated: !currentValue };
        return updated;
      } else {
        // Add new entry
        return [...prev, { date: dateStr, is_modulated: !currentValue }];
      }
    });
    
    // Call the parent handler
    onToggleModulation(date, currentValue);
  };

  // If there's no data yet, show a placeholder row instead of empty state
  if (isLoading) {
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
            <TableRow>
              <TableCell colSpan={3} className="text-center">
                Cargando datos...
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

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
          {daysToDisplay.length === 0 ? (
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
                          handleToggleModulation(day, isModulated);
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
