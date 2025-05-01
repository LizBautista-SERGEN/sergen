
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AlertTriangle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

interface ModulationDay {
  date: string;
  is_modulated: boolean;
}

interface SelectedDayModulationProps {
  selectedDate: Date;
  selectedDayData: ModulationDay | null;
  isDateInFuture: (date: Date) => boolean;
  onToggleModulation: (date: Date, currentValue: boolean) => void;
}

export const SelectedDayModulation = ({ 
  selectedDate, 
  selectedDayData, 
  isDateInFuture,
  onToggleModulation 
}: SelectedDayModulationProps) => {
  // Local state to track toggle state for immediate UI feedback
  const [isToggling, setIsToggling] = useState(false);
  
  const handleToggleChange = () => {
    if (isDateInFuture(selectedDate)) return;
    
    setIsToggling(true);
    onToggleModulation(selectedDate, selectedDayData?.is_modulated || false);
    
    // Reset toggling state after a delay
    setTimeout(() => {
      setIsToggling(false);
    }, 500);
  };
  
  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Modulación del día seleccionado</h3>
      {selectedDate && !isDateInFuture(selectedDate) ? (
        <div className="flex items-center justify-between px-4 py-3 border rounded-md">
          <div>
            <p className="font-medium">Fecha: {format(selectedDate, 'dd/MM/yyyy', { locale: es })}</p>
            <p className={selectedDayData?.is_modulated ? "text-red-500 font-medium" : "text-green-500 font-medium"}>
              Estado: {selectedDayData?.is_modulated ? "Modulado" : "No Modulado"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={selectedDayData?.is_modulated ? "text-red-500" : "text-green-500"}>
              {selectedDayData?.is_modulated ? "Modulado" : "No Modulado"}
            </span>
            <Switch
              checked={selectedDayData?.is_modulated || false}
              onCheckedChange={handleToggleChange}
              disabled={isToggling}
              className={isToggling ? "opacity-70" : ""}
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-3 text-amber-600 bg-amber-50 rounded-md">
          <AlertTriangle className="h-5 w-5" />
          <p>Seleccione un día pasado o el día actual para ver y modificar su estado de modulación.</p>
        </div>
      )}
      <div className="flex items-center gap-2 mt-4 text-amber-600 bg-amber-50 p-3 rounded-md">
        <AlertTriangle className="h-5 w-5" />
        <p className="text-sm">No se puede modificar el estado de modulación de días futuros.</p>
      </div>
    </div>
  );
};
