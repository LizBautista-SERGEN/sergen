
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MonthSelectorProps {
  selectedMonth: Date;
  onMonthChange: (increment: boolean) => void;
}

export const MonthSelector = ({ selectedMonth, onMonthChange }: MonthSelectorProps) => {
  const formattedMonth = format(selectedMonth, 'MMMM yyyy', { locale: es });
  // Capitalize first letter
  const displayMonth = formattedMonth.charAt(0).toUpperCase() + formattedMonth.slice(1);
  
  return (
    <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-lg border shadow-sm">
      <Button 
        variant="outline" 
        onClick={() => onMonthChange(false)}
        size="icon"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <h2 className="text-xl font-bold">
        {displayMonth}
      </h2>
      <Button 
        variant="outline" 
        onClick={() => onMonthChange(true)}
        size="icon"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
