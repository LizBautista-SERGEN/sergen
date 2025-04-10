
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";

interface MonthSelectorProps {
  selectedMonth: Date;
  onMonthChange: (increment: boolean) => void;
}

export const MonthSelector = ({ selectedMonth, onMonthChange }: MonthSelectorProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <Button 
        variant="outline" 
        onClick={() => onMonthChange(false)}
      >
        Mes Anterior
      </Button>
      <h2 className="text-xl font-bold">
        {format(selectedMonth, 'MMMM yyyy', { locale: es })}
      </h2>
      <Button 
        variant="outline" 
        onClick={() => onMonthChange(true)}
      >
        Mes Siguiente
      </Button>
    </div>
  );
};
