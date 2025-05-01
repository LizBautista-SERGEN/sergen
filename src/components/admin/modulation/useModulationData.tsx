
import { useState, useEffect, useCallback } from "react";
import { format, isAfter, startOfMonth, endOfMonth, addMonths, startOfYear } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ModulationDay {
  date: string;
  is_modulated: boolean;
}

export const useModulationData = (refreshTrigger?: number) => {
  const today = new Date();
  const startDate = startOfYear(new Date(2025, 0, 1)); // January 2025
  
  const [selectedDate, setSelectedDate] = useState<Date>(today > startDate ? today : startDate);
  const [selectedMonth, setSelectedMonth] = useState<Date>(startDate); // Start from January 2025
  const [modulationData, setModulationData] = useState<ModulationDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDayData, setSelectedDayData] = useState<ModulationDay | null>(null);

  const fetchModulationData = useCallback(async (month: Date) => {
    setIsLoading(true);
    
    try {
      const start = startOfMonth(month).toISOString().split('T')[0];
      const end = endOfMonth(month).toISOString().split('T')[0];

      // Check authentication before making the request
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        console.log('User not authenticated, skipping data fetch');
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('modulation_days')
        .select('date, is_modulated')
        .gte('date', start)
        .lte('date', end)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error al cargar datos de modulación:', error);
        toast.error("Error al cargar datos de modulación");
        return;
      }

      // Store the fetched data
      setModulationData(data || []);
      
      // Update selected day data if there's a selected date
      if (selectedDate) {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const dayRecord = data?.find(d => d.date === dateStr) || null;
        setSelectedDayData(dayRecord);
      }
    } catch (error) {
      console.error('Error en fetchModulationData:', error);
      toast.error('Error al cargar los datos de modulación');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  // Fetch data only when the month changes or manual refresh is triggered
  useEffect(() => {
    if (refreshTrigger || selectedMonth) {
      fetchModulationData(selectedMonth);
    }
  }, [selectedMonth, fetchModulationData, refreshTrigger]);

  // Update selected day data when the selected date or modulation data changes
  useEffect(() => {
    if (selectedDate && modulationData.length > 0) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const dayRecord = modulationData.find(d => d.date === dateStr) || null;
      setSelectedDayData(dayRecord);
    }
  }, [selectedDate, modulationData]);

  const handleToggleModulation = useCallback(async (date: Date, currentValue: boolean) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    try {
      // Ensure we have an authenticated session before updating
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        toast.error('Debe iniciar sesión para actualizar la modulación');
        return;
      }

      // Log the operation being attempted
      console.log(`Toggling modulation for ${dateStr} from ${currentValue} to ${!currentValue}`);

      const { error } = await supabase
        .from('modulation_days')
        .upsert({
          date: dateStr,
          is_modulated: !currentValue
        }, { onConflict: 'date' });

      if (error) {
        console.error('Error al actualizar modulación:', error);
        toast.error('Error al actualizar la modulación: ' + error.message);
        return;
      }

      console.log('Modulation update successful');

      // Update the local state for immediate feedback
      setModulationData(prev => {
        const updatedData = [...prev];
        const existingIndex = updatedData.findIndex(day => day.date === dateStr);
        
        if (existingIndex >= 0) {
          // Update existing record
          updatedData[existingIndex] = { 
            ...updatedData[existingIndex], 
            is_modulated: !currentValue 
          };
        } else {
          // Add new record
          updatedData.push({ 
            date: dateStr, 
            is_modulated: !currentValue 
          });
        }
        
        return updatedData;
      });
      
      // Update selected day data if this is the currently selected day
      if (format(selectedDate, 'yyyy-MM-dd') === dateStr) {
        setSelectedDayData({ date: dateStr, is_modulated: !currentValue });
      }
      
      toast.success('Modulación actualizada correctamente');
    } catch (error) {
      console.error('Error en handleToggleModulation:', error);
      toast.error('Error al actualizar la modulación');
    }
  }, [selectedDate]);

  const handleMonthChange = useCallback((increment: boolean) => {
    setSelectedMonth(prev => addMonths(prev, increment ? 1 : -1));
  }, []);

  const getDateClassName = useCallback((date: Date): string => {
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
  }, [modulationData]);

  const isDateInFuture = useCallback((date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return isAfter(date, today);
  }, []);

  const handleDateSelect = useCallback((date: Date | undefined) => {
    if (date && !isDateInFuture(date)) {
      setSelectedDate(date);
      
      // Also find the modulation data for this date
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayRecord = modulationData.find(d => d.date === dateStr) || null;
      setSelectedDayData(dayRecord);
    }
  }, [modulationData, isDateInFuture]);

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
    fetchModulationData
  };
};
