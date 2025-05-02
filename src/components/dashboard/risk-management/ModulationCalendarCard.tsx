
import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, isBefore, isAfter, isSameDay, parseISO } from "date-fns";
import { es } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { ModulationLegend } from "@/components/admin/modulation/ModulationLegend";

interface ModulationCalendarCardProps {
  date: Date | undefined;
  selectedMonth: Date;
  modulationData: { date: string; is_modulated: boolean }[];
  onDateSelect: (date: Date | undefined) => void;
  onMonthChange: (date: Date) => void;
}

export const ModulationCalendarCard = ({
  date,
  selectedMonth,
  modulationData,
  onDateSelect,
  onMonthChange
}: ModulationCalendarCardProps) => {
  const isDateModulated = (date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayData = modulationData.find(data => data.date === dateStr);
    return dayData?.is_modulated || false;
  };

  const isDateInFuture = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return isAfter(date, today);
  };

  const getDateClassName = (date: Date): string => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const modulationDay = modulationData.find(d => d.date === dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isAfter(date, today)) {
      return "text-gray-400"; // Días futuros en gris
    }
    
    if (modulationDay?.is_modulated) {
      return "text-red-500 font-bold"; // Días modulados en rojo
    }
    
    return "text-green-500"; // Días no modulados en verde
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate && !isDateInFuture(selectedDate)) {
      onDateSelect(selectedDate);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-center">Calendario</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          month={selectedMonth}
          onMonthChange={onMonthChange}
          className="rounded-md border"
          locale={es}
          components={{
            Day: ({ date }) => (
              <div 
                className={cn(
                  "h-9 w-9 p-0 font-normal flex items-center justify-center",
                  getDateClassName(date)
                )}
              >
                {date.getDate()}
              </div>
            )
          }}
        />
        <ModulationLegend />
      </CardContent>
    </Card>
  );
};
