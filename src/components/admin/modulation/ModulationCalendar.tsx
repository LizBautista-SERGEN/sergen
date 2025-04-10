
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { es } from "date-fns/locale";

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
            <div className={cn(getDateClassName(date))}>
              {date.getDate()}
            </div>
          )
        }}
      />
    </div>
  );
};
