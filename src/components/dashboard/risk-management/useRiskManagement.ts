
import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, isBefore, isAfter, isFuture, isPast, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { ModulationDay, ForecastSettings } from "./types";
import { EnergyData } from "@/types/energy";

export const useRiskManagement = (energyData: EnergyData[], date: Date | undefined, setDate: (date: Date | undefined) => void) => {
  const [maxPower, setMaxPower] = useState<number>(0);
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
  }, [date, energyData]);

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

  // Count modulated days - FIX: Count all modulated days, not just those in the future
  useEffect(() => {
    const now = new Date();
    const currentMonth = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    
    let count = 0;
    modulationData.forEach(data => {
      const dataDate = parseISO(data.date);
      // FIX: Remove the !isFuture(dataDate) condition to count all modulated days
      if (data.is_modulated && 
          isAfter(dataDate, currentMonth) && 
          isBefore(dataDate, monthEnd)) {
        count++;
      }
    });

    setModulatedDays(count);
  }, [modulationData]);

  const isDateModulated = (date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayData = modulationData.find(data => data.date === dateStr);
    return dayData?.is_modulated || false;
  };

  // Fallback function if real data not available
  const calculateMaxPower = () => {
    if (!date || !energyData.length) return;

    const selectedDateStr = format(date, 'yyyy-MM-dd');
    const dayData = energyData.find(data => data.date === selectedDateStr);
    
    if (!dayData) return;

    const intervals = [];
    for (let hour = 18; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        intervals.push(dayData.forecasted_power * (0.85 + Math.random() * 0.3));
      }
    }
    
    const maxValue = Math.max(...intervals);
    setMaxPower(Number(maxValue.toFixed(2)));
  };

  return {
    maxPower,
    settings,
    modulatedDays,
    modulationData,
    isLoading,
    selectedMonth,
    setSelectedMonth,
    setDate,
    isDateModulated
  };
};
