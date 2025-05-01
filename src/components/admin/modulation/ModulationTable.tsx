
import { format, getDaysInMonth, parseISO, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState, memo, useMemo } from "react";

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
  lastRefresh?: number;
}

// Create a memoized table row component to prevent re-renders
const ModulationTableRow = memo(({ 
  day, 
  isModulated, 
  onToggleModulation 
}: { 
  day: Date, 
  isModulated: boolean, 
  onToggleModulation: (date: Date, value: boolean) => void 
}) => {
  return (
    <TableRow className={isModulated ? "bg-red-50" : "bg-green-50"}>
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
});

ModulationTableRow.displayName = "ModulationTableRow";

export const ModulationTable = ({
  selectedMonth,
  modulationData,
  isLoading,
  isDateInFuture,
  onToggleModulation,
  lastRefresh
}: ModulationTableProps) => {
  const [tableData, setTableData] = useState<ModulationDay[]>([]);
  
  // Update table data when modulationData changes
  useEffect(() => {
    if (!isLoading && modulationData?.length >= 0) {
      setTableData(modulationData);
    }
  }, [modulationData, isLoading]);

  // Generate days for the selected month
  const daysToDisplay = useMemo(() => {
    const daysInMonth = getDaysInMonth(selectedMonth);
    const startDay = startOfMonth(selectedMonth);
    const days: Date[] = [];

    for (let i = 0; i < daysInMonth; i++) {
      const day = new Date(startDay);
      day.setDate(day.getDate() + i);
      if (!isDateInFuture(day)) {
        days.push(day);
      }
    }

    return days;
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
                <ModulationTableRow 
                  key={format(day, 'yyyy-MM-dd')} 
                  day={day} 
                  isModulated={isModulated} 
                  onToggleModulation={handleToggleModulation} 
                />
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
