
import { useState, useEffect, useCallback } from "react";
import { format, addMonths, startOfYear } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ModulationDay } from "../types/modulationTypes";
import { isDateInFuture, formatDateToString } from "../utils/dateUtils";
import { fetchModulationData, toggleModulation } from "../services/modulationService";

export const useModulationData = () => {
  const today = new Date();
  const startDate = startOfYear(new Date(2025, 0, 1)); // January 2025
  
  // Set the default month to the current month instead of always January 2025
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [selectedMonth, setSelectedMonth] = useState<Date>(today); 
  const [modulationData, setModulationData] = useState<ModulationDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDayData, setSelectedDayData] = useState<ModulationDay | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(Date.now());

  const fetchData = useCallback(async (month: Date) => {
    setIsLoading(true);
    try {
      const data = await fetchModulationData(month);
      setModulationData(data);
      
      // Update selected day data if there's a selected date
      if (selectedDate) {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const dayRecord = data?.find(d => d.date === dateStr) || null;
        setSelectedDayData(dayRecord);
      }
      
      setLastFetchTime(Date.now());
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchData(selectedMonth);
  }, [selectedMonth, fetchData]);

  useEffect(() => {
    if (selectedDate) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const dayRecord = modulationData.find(d => d.date === dateStr) || null;
      setSelectedDayData(dayRecord);
    }
  }, [selectedDate, modulationData]);

  const handleToggleModulation = async (date: Date, currentValue: boolean) => {
    const dateStr = formatDateToString(date);
    
    try {
      // Ensure we have an authenticated session before updating
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        toast.error('Debe iniciar sesión para actualizar la modulación');
        return;
      }

      // Optimistically update the UI first
      const updatedData = modulationData.map(day => 
        day.date === dateStr 
          ? { ...day, is_modulated: !currentValue } 
          : day
      );
      
      // If the day doesn't exist in our current data, add it
      if (!updatedData.find(day => day.date === dateStr)) {
        updatedData.push({ date: dateStr, is_modulated: !currentValue });
      }
      
      setModulationData(updatedData);
      
      // Update selected day data if this is the currently selected day
      if (format(selectedDate, 'yyyy-MM-dd') === dateStr) {
        setSelectedDayData({ date: dateStr, is_modulated: !currentValue });
      }

      // Call the API to update the data
      const success = await toggleModulation(dateStr, currentValue);
      
      if (!success) {
        // Revert optimistic update on error
        fetchData(selectedMonth);
        return;
      }
      
      toast.success('Modulación actualizada correctamente');
    } catch (error) {
      console.error('Error en handleToggleModulation:', error);
      toast.error('Error al actualizar la modulación');
      
      // Revert optimistic update on error
      fetchData(selectedMonth);
    }
  };

  const handleMonthChange = (increment: boolean) => {
    setSelectedMonth(prev => addMonths(prev, increment ? 1 : -1));
  };

  const getDateClassName = (date: Date): string => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const modulationDay = modulationData.find(d => d.date === dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isDateInFuture(date)) {
      return "text-gray-400"; // Días futuros en gris
    }
    
    if (modulationDay?.is_modulated) {
      return "text-red-500 font-bold"; // Días modulados en rojo
    }
    
    return "text-green-500"; // Días no modulados en verde
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date && !isDateInFuture(date)) {
      setSelectedDate(date);
      
      // Also find the modulation data for this date
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayRecord = modulationData.find(d => d.date === dateStr) || null;
      setSelectedDayData(dayRecord);
    }
  };

  // Manual refresh function
  const refreshModulationData = () => {
    fetchData(selectedMonth);
  };

  return {
    selectedDate,
    selectedMonth,
    modulationData,
    isLoading,
    selectedDayData,
    startDate,
    handleToggleModulation,
    handleMonthChange,
    getDateClassName,
    isDateInFuture,
    handleDateSelect,
    setSelectedMonth,
    refreshModulationData,
    lastFetchTime
  };
};
