
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";

interface ModulationCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date | undefined) => void;
  modulatedDates: { [key: string]: boolean };
}

export const ModulationCalendar = ({
  selectedDate,
  onSelectDate,
  modulatedDates,
}: ModulationCalendarProps) => {
  const isDateModulated = (date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return modulatedDates[dateStr] || false;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendario de Modulación</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onSelectDate}
          className="rounded-md border"
          locale={es}
          fixedWeeks
          modifiers={{
            modulated: (date) => isDateModulated(date),
            notModulated: (date) => !isDateModulated(date),
            current: (date) => isSameDay(date, new Date())
          }}
          modifiersStyles={{
            modulated: { 
              color: "#C00000",
              backgroundColor: "transparent"
            },
            notModulated: { 
              color: "#34D399",
              backgroundColor: "transparent"
            },
            current: {
              fontWeight: "bold",
              border: "2px solid #FEC6A1",
              backgroundColor: "transparent"
            }
          }}
        />
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="text-[#C00000]">●</div>
            <span className="text-sm">Con modulación</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-[#34D399]">●</div>
            <span className="text-sm">Sin modulación</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
