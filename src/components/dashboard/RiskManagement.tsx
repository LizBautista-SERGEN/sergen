
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { EnergyData } from "@/types/energy";
import { format, startOfMonth, endOfMonth, isBefore, isAfter, isFuture, isPast, isSameDay, parseISO } from "date-fns";
import { es } from 'date-fns/locale';
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { ModulationLegend } from "../admin/modulation/ModulationLegend";

interface RiskManagementProps {
  energyData: EnergyData[];
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

interface ModulationDay {
  date: string;
  is_modulated: boolean;
}

interface ForecastSettings {
  risk_level: string;
  modulation_time: string;
}

export const RiskManagement = ({ energyData, date, setDate }: RiskManagementProps) => {
  const [maxPower, setMaxPower] = useState<number>(0);
  const [backgroundColor, setBackgroundColor] = useState<string>("#156082");
  const [modulatedDays, setModulatedDays] = useState(0);
  const [modulationData, setModulationData] = useState<ModulationDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [settings, setSettings] = useState<ForecastSettings>({ 
    risk_level: "MEDIO", 
    modulation_time: "18:00 - 23:00" 
  });
  
  // Fetch forecast settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('forecast_settings')
          .select('risk_level, modulation_time')
          .order('last_update', { ascending: false })
          .limit(1)
          .single();
        
        if (error) {
          console.error('Error fetching settings:', error);
          return;
        }

        if (data) {
          setSettings({
            risk_level: data.risk_level || "MEDIO",
            modulation_time: data.modulation_time || "18:00 - 23:00"
          });
          
          // Set background color based on risk level
          if (data.risk_level === "ALTO") {
            setBackgroundColor("#ea384c"); // Red
          } else if (data.risk_level === "MEDIO") {
            setBackgroundColor("#F97316"); // Amber
          } else if (data.risk_level === "BAJO") {
            setBackgroundColor("#84cc16"); // Green
          }
        }
      } catch (error) {
        console.error('Error in fetchSettings:', error);
      }
    };

    fetchSettings();
  }, []);

  // Fetch max power from coes_forecast for selected date
  useEffect(() => {
    const fetchMaxPower = async () => {
      if (!date) return;
      
      try {
        const startOfDay = new Date(date);
        startOfDay.setHours(18, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        const { data, error } = await supabase
          .from('coes_forecast')
          .select('pronostico')
          .gte('fecha', startOfDay.toISOString())
          .lte('fecha', endOfDay.toISOString())
          .order('pronostico', { ascending: false })
          .limit(1);
          
        if (error) {
          console.error('Error fetching max power:', error);
          return;
        }
        
        if (data && data.length > 0 && data[0].pronostico) {
          setMaxPower(Number(data[0].pronostico.toFixed(2)));
        } else {
          // Fallback to simulated data if real data not available
          calculateMaxPower();
        }
      } catch (error) {
        console.error('Error in fetchMaxPower:', error);
        calculateMaxPower(); // Fallback
      }
    };
    
    fetchMaxPower();
  }, [date]);

  // Fetch modulation data
  useEffect(() => {
    const fetchModulationData = async () => {
      setIsLoading(true);
      try {
        const start = startOfMonth(selectedMonth).toISOString().split('T')[0];
        const end = endOfMonth(selectedMonth).toISOString().split('T')[0];

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
  }, [selectedMonth]);

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

  // Fallback function if real data not available
  const calculateMaxPower = () => {
    if (!date || !energyData.length) return;

    const selectedDateStr = format(date, 'yyyy-MM-dd');
    const dayData = energyData.find(data => data.date === selectedDateStr);
    
    if (!dayData) return;

    // Highlight red background if the date is modulated
    const isModulated = isDateModulated(date);
    if (isModulated) {
      setBackgroundColor("#C00000");
    }

    const intervals = [];
    for (let hour = 18; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        intervals.push(dayData.forecasted_power * (0.85 + Math.random() * 0.3));
      }
    }
    
    const maxValue = Math.max(...intervals);
    setMaxPower(Number(maxValue.toFixed(2)));
  };

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
      setDate(selectedDate);
    }
  };

  const getRiskLevelColor = (level: string): string => {
    switch(level) {
      case "ALTO":
        return "#ea384c"; // Red
      case "MEDIO":
        return "#F97316"; // Amber
      case "BAJO":
        return "#84cc16"; // Green
      default:
        return "#156082"; // Default blue
    }
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
              <p className="px-4 h-[42px] rounded w-full flex items-center justify-center text-white" style={{ backgroundColor: "#156082" }}>{maxPower}</p>
            </div>
            <div className="text-center w-[200px]">
              <p className="text-[#8E9196] text-sm">Rango horario</p>
              <p style={{ backgroundColor: "#156082" }} className="text-white px-4 h-[42px] rounded w-full flex items-center justify-center">{settings.modulation_time}</p>
            </div>
            <div className="text-center w-[200px]">
              <p className="text-[#8E9196] text-sm">Riesgo de coincidente</p>
              <p style={{ backgroundColor: getRiskLevelColor(settings.risk_level) }} className="text-white px-4 h-[42px] rounded w-full flex items-center justify-center">
                {settings.risk_level}
              </p>
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
            onSelect={handleDateSelect}
            month={selectedMonth}
            onMonthChange={setSelectedMonth}
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
    </>
  );
};
