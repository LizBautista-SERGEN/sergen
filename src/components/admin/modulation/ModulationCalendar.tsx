
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { es } from "date-fns/locale";
import { isSameMonth } from "date-fns";

interface ModulationCalendarProps {
  selectedDate: Date;
  selectedMonth: Date;
  startDate: Date;
  onDateSelect: (date: Date | undefined) => void;
  onMonthChange: (month: Date) => void;
  isDateInFuture: (date: Date) => boolean;
  getDateClassName: (date: Date) => string;
}

export const ModulationCalendar = ({
  selectedDate,
  selectedMonth,
  startDate,
  onDateSelect,
  onMonthChange,
  isDateInFuture,
  getDateClassName
}: ModulationCalendarProps) => {
  const getCalendarDateClassName = (date: Date): string => {
    // Check if the date is from a different month first
    if (!isSameMonth(date, selectedMonth)) {
      return "text-white"; // Days from other months in white
    }
    
    // Then apply the existing classification
    return getDateClassName(date);
  };

  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onDateSelect}
        month={selectedMonth}
        onMonthChange={onMonthChange}
        className="rounded-md border w-full pointer-events-auto"
        disabled={isDateInFuture}
        fromDate={startDate}
        locale={es}
        components={{
          Day: ({ date }) => (
            <div 
              className={cn(
                "h-9 w-9 p-0 font-normal flex items-center justify-center",
                getCalendarDateClassName(date)
              )}
            >
              {date.getDate()}
            </div>
          )
        }}
      />
    </div>
  );
};
