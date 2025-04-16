
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { EnergyData } from "@/types/energy";
import { format, startOfMonth, endOfMonth, isBefore, isAfter, isFuture, isPast, isSameDay, parseISO } from "date-fns";
import { es } from 'date-fns/locale';
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface RiskManagementProps {
  energyData: EnergyData[];
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

interface ModulationDay {
  date: string;
  is_modulated: boolean;
}

export const RiskManagement = ({ energyData, date, setDate }: RiskManagementProps) => {
  const [maxPower, setMaxPower] = useState<number>(0);
  const [backgroundColor, setBackgroundColor] = useState<string>("#156082");
  const [modulatedDays, setModulatedDays] = useState(0);
  const [modulationData, setModulationData] = useState<ModulationDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch modulation data
  useEffect(() => {
    const fetchModulationData = async () => {
      setIsLoading(true);
      try {
        const now = new Date();
        const start = startOfMonth(now).toISOString().split('T')[0];
        const end = endOfMonth(now).toISOString().split('T')[0];

        const { data, error } = await supabase
          .from('modulation_days')
          .select('date, is_modulated')
          .gte('date', start)
          .lte('date', end)
          .order('date', { ascending: true });

        if (error) {
          console.error('Error al cargar datos de modulación:', error);
          return;
        }

        setModulationData(data || []);
      } catch (error) {
        console.error('Error en fetchModulationData:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModulationData();
  }, []);

  const isDateModulated = (date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayData = modulationData.find(data => data.date === dateStr);
    return dayData?.is_modulated || false;
  };

  useEffect(() => {
    const calculateMaxPower = () => {
      if (!date || !energyData.length) return;

      const selectedDateStr = format(date, 'yyyy-MM-dd');
      const dayData = energyData.find(data => data.date === selectedDateStr);
      
      if (!dayData) return;

      // Highlight red background if the date is modulated
      const isModulated = isDateModulated(date);
      setBackgroundColor(isModulated ? "#C00000" : "#156082");

      const intervals = [];
      for (let hour = 18; hour <= 23; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
          intervals.push(dayData.forecasted_power * (0.85 + Math.random() * 0.3));
        }
      }
      
      const maxValue = Math.max(...intervals);
      setMaxPower(Number(maxValue.toFixed(2)));
    };

    calculateMaxPower();
    const interval = setInterval(calculateMaxPower, 60000);

    return () => clearInterval(interval);
  }, [date, energyData, modulationData]);

  useEffect(() => {
    const now = new Date();
    const currentMonth = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    
    let count = 0;
    modulationData.forEach(data => {
      const dataDate = parseISO(data.date);
      if (data.is_modulated && 
          !isFuture(dataDate) &&
          isAfter(dataDate, currentMonth) && 
          isBefore(dataDate, monthEnd)) {
        count++;
      }
    });

    setModulatedDays(count);
  }, [modulationData]);

  // Custom day renderer for the Calendar
  const getDayClassName = (day: Date): string => {
    const isModulated = isDateModulated(day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isFuture(day)) {
      return "text-gray-400"; // Future days in gray
    }
    
    if (isModulated) {
      return "text-red-500 font-bold"; // Modulated days in red
    }
    
    return "text-green-500"; // Non-modulated days in green
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-center">Gestión de riesgo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-2 flex flex-col items-center">
            <div className="text-center w-[200px]">
              <p className="text-[#8E9196] text-sm">Potencia Máxima</p>
              <p className="px-4 h-[42px] rounded w-full flex items-center justify-center text-white" style={{ backgroundColor }}>{maxPower}</p>
            </div>
            <div className="text-center w-[200px]">
              <p className="text-[#8E9196] text-sm">Rango horario</p>
              <p style={{ backgroundColor }} className="text-white px-4 h-[42px] rounded w-full flex items-center justify-center">Sin modulación</p>
            </div>
            <div className="text-center w-[200px]">
              <p className="text-[#8E9196] text-sm">Riesgo de coincidente</p>
              <p style={{ backgroundColor }} className="text-white px-4 h-[42px] rounded w-full flex items-center justify-center">BAJO</p>
            </div>
            <div className="text-center w-[200px]">
              <p className="text-sm text-gray-500">Días modulados</p>
              <p style={{ backgroundColor: '#156082' }} className="text-white px-4 h-[42px] rounded w-full flex items-center justify-center border">
                {modulatedDays} días
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-center">Calendario</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
            locale={es}
            components={{
              Day: ({ date: dayDate }) => (
                <div 
                  className={cn(
                    "h-9 w-9 p-0 font-normal flex items-center justify-center",
                    getDayClassName(dayDate)
                  )}
                >
                  {dayDate.getDate()}
                </div>
              )
            }}
          />
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#C00000]"></div>
              <span className="text-sm">Con modulación</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#34D399]"></div>
              <span className="text-sm">Sin modulación</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
