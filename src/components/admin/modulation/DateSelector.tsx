
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateSelectorProps {
  selectedDate: Date;
  selectedMonth: Date;
  startDate: Date;
  onDateSelect: (date: Date | undefined) => void;
  onMonthChange: (month: Date) => void;
  isDateInFuture: (date: Date) => boolean;
  getDateClassName: (date: Date) => string;
}

export const DateSelector = ({ 
  selectedDate, 
  selectedMonth, 
  startDate, 
  onDateSelect, 
  onMonthChange,
  isDateInFuture,
  getDateClassName 
}: DateSelectorProps) => {
  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm mb-4">
      <h3 className="text-lg font-semibold mb-4">Seleccionar Fecha</h3>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: es }) : "Seleccione una fecha"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateSelect}
            month={selectedMonth}
            onMonthChange={onMonthChange}
            disabled={isDateInFuture}
            initialFocus
            fromDate={startDate}
            locale={es}
            components={{
              Day: ({ date }) => (
                <div className={cn(getDateClassName(date))}>
                  {date.getDate()}
                </div>
              )
            }}
            className="rounded-md border p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
