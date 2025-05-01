import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { EnergyData } from "@/types/energy";
import { format, startOfMonth, endOfMonth, isBefore, isAfter, isFuture, isPast, isSameDay, parseISO } from "date-fns";
import { es } from 'date-fns/locale';
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { ModulationLegend } from "../admin/modulation/ModulationLegend";
import { toast } from "sonner";
import { ForecastSettings } from "@/types/forecast";

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
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [settings, setSettings] = useState<ForecastSettings | null>(null);
  const [timeRange, setTimeRange] = useState("18:00 - 23:00");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('forecast_settings')
          .select('*')
          .single();
        
        if (error) {
          console.error('Error fetching settings:', error);
          return;
        }

        if (data) {
          setSettings(data as ForecastSettings);
          setTimeRange(data.time_range || "18:00 - 23:00");
          if (data.last_update) {
            setLastUpdated(new Date(data.last_update));
          }
        }
      } catch (error) {
        console.error('Error in fetchSettings:', error);
      }
    };

    fetchSettings();
    // Refresh settings every 5 minutes
    const interval = setInterval(fetchSettings, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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
          toast.error('Error al cargar datos de modulación');
          return;
        }

        setModulationData(data || []);
      } catch (error) {
        console.error('Error en fetchModulationData:', error);
        toast.error('Error al cargar datos de modulación');
      } finally {
        setIsLoading(false);
      }
    };

    fetchModulationData();
  }, [selectedMonth]);

  // Fetch max power for the selected date
  useEffect(() => {
    const fetchMaxPower = async () => {
      if (!date) return;
      
      try {
        // Get time range from settings
        const [startHour, endHour] = (settings?.time_range || "18:00 - 23:00").split('-').map(time => time.trim());
        
        // Format the date
        const dateStr = format(date, 'yyyy-MM-dd');
        
        // Query Supabase for the maximum power between the specified time range
        const { data, error } = await supabase
          .from('coes_forecast')
          .select('fecha, pronostico')
          .gte('fecha', `${dateStr}T${startHour}:00`)
          .lt('fecha', `${dateStr}T${endHour}:59`)
          .order('pronostico', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error al obtener potencia máxima:', error);
          return;
        }

        if (data && data.length > 0) {
          setMaxPower(Number(data[0].pronostico.toFixed(2)));
        } else {
          // Fallback to the old calculation method
          if (energyData.length) {
            const selectedDateStr = format(date, 'yyyy-MM-dd');
            const dayData = energyData.find(data => data.date === selectedDateStr);
            
            if (dayData) {
              const randomMax = dayData.forecasted_power * (0.85 + Math.random() * 0.3);
              setMaxPower(Number(randomMax.toFixed(2)));
            }
          }
        }

        // Check if the date is modulated
        const isModulated = isDateModulated(date);
        updateBackgroundColor(isModulated, settings?.risk_level);
      } catch (error) {
        console.error('Error fetching max power:', error);
      }
    };

    fetchMaxPower();
    const interval = setInterval(fetchMaxPower, 60000);
    return () => clearInterval(interval);
  }, [date, energyData, settings, modulationData]);

  const updateBackgroundColor = (isModulated: boolean, riskLevel?: string) => {
    if (isModulated) {
      setBackgroundColor("#C00000");
      return;
    }
    
    // Apply color based on risk level
    switch (riskLevel) {
      case "BAJO":
        setBackgroundColor("#22c55e"); // green-500
        break;
      case "MEDIO":
        setBackgroundColor("#f97316"); // amber-500
        break;
      case "ALTO":
        setBackgroundColor("#ef4444"); // red-500
        break;
      default:
        setBackgroundColor("#156082"); // default blue
    }
  };

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

  // Get risk level text color based on background
  const getRiskTextColor = () => {
    // For medium risk (amber) use black text, for others use white
    return settings?.risk_level === "MEDIO" ? "text-black" : "text-white";
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
              <p style={{ backgroundColor }} className="text-white px-4 h-[42px] rounded w-full flex items-center justify-center">{timeRange}</p>
            </div>
            <div className="text-center w-[200px]">
              <p className="text-[#8E9196] text-sm">Riesgo de coincidente</p>
              <p 
                style={{ backgroundColor }} 
                className={`px-4 h-[42px] rounded w-full flex items-center justify-center ${getRiskTextColor()}`}
              >
                {settings?.risk_level || "BAJO"}
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
