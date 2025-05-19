
import { useState, useEffect, useCallback } from "react";
import { format, isAfter, startOfMonth, endOfMonth, addMonths, startOfYear } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ModulationDay {
  date: string;
  is_modulated: boolean;
}

export const useModulationData = () => {
  const today = new Date();
  const startDate = startOfYear(new Date(2025, 0, 1)); // January 2025
  
  const [selectedDate, setSelectedDate] = useState<Date>(today > startDate ? today : startDate);
  const [selectedMonth, setSelectedMonth] = useState<Date>(today > startDate ? today : startDate); // Changed to default to current month
  const [modulationData, setModulationData] = useState<ModulationDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDayData, setSelectedDayData] = useState<ModulationDay | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(Date.now());

  const fetchModulationData = useCallback(async (month: Date) => {
    setIsLoading(true);
    try {
      const start = startOfMonth(month).toISOString().split('T')[0];
      const end = endOfMonth(month).toISOString().split('T')[0];

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

      setModulationData(data || []);
      
      // Update selected day data if there's a selected date
      if (selectedDate) {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const dayRecord = data?.find(d => d.date === dateStr) || null;
        setSelectedDayData(dayRecord);
      }
      
      setLastFetchTime(Date.now());
    } catch (error) {
      console.error('Error en fetchModulationData:', error);
      toast.error('Error al cargar los datos de modulación');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchModulationData(selectedMonth);
  }, [selectedMonth, fetchModulationData]);

  useEffect(() => {
    if (selectedDate) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const dayRecord = modulationData.find(d => d.date === dateStr) || null;
      setSelectedDayData(dayRecord);
    }
  }, [selectedDate, modulationData]);

  const handleToggleModulation = async (date: Date, currentValue: boolean) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
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

      // Check if the record exists - use eq with limit to avoid multiple rows issue
      const { data: existingRecords, error: checkError } = await supabase
        .from('modulation_days')
        .select('id')
        .eq('date', dateStr);
        
      if (checkError) {
        console.error('Error checking existing modulation:', checkError);
        toast.error('Error al verificar modulación existente');
        fetchModulationData(selectedMonth); // Revert optimistic update
        return;
      }
      
      let error;
      
      if (existingRecords && existingRecords.length > 0) {
        // Get the first record's id (in case there are duplicates)
        const recordId = existingRecords[0].id;
        
        // Update existing record
        const { error: updateError } = await supabase
          .from('modulation_days')
          .update({ is_modulated: !currentValue })
          .eq('id', recordId);
          
        error = updateError;
        
        // If there are multiple records with the same date, remove the duplicates
        if (existingRecords.length > 1) {
          // Get all ids except the first one (which we just updated)
          const duplicateIds = existingRecords.slice(1).map(record => record.id);
          
          // Delete the duplicates
          await supabase
            .from('modulation_days')
            .delete()
            .in('id', duplicateIds);
        }
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('modulation_days')
          .insert([{
            date: dateStr,
            is_modulated: !currentValue
          }]);
          
        error = insertError;
      }

      if (error) {
        console.error('Error al actualizar modulación:', error);
        toast.error('Error al actualizar la modulación: ' + error.message);
        
        // Revert optimistic update on error
        fetchModulationData(selectedMonth);
        return;
      }
      
      toast.success('Modulación actualizada correctamente');
    } catch (error) {
      console.error('Error en handleToggleModulation:', error);
      toast.error('Error al actualizar la modulación');
      
      // Revert optimistic update on error
      fetchModulationData(selectedMonth);
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

    if (isAfter(date, today)) {
      return "text-gray-400"; // Días futuros en gris
    }
    
    if (modulationDay?.is_modulated) {
      return "text-red-500 font-bold"; // Días modulados en rojo
    }
    
    return "text-green-500"; // Días no modulados en verde
  };

  const isDateInFuture = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return isAfter(date, today);
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
    fetchModulationData(selectedMonth);
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
