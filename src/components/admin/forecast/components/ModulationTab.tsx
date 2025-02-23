
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ModulationCalendar } from "./modulation/ModulationCalendar";
import { ModulationTable } from "./modulation/ModulationTable";

export const ModulationTab = () => {
  const [modulatedDates, setModulatedDates] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const fetchModulatedDates = async () => {
    try {
      setLoading(true);
      const startDate = startOfMonth(new Date());
      const endDate = endOfMonth(new Date());

      const { data, error } = await supabase
        .from('power_peaks')
        .select('date, is_modulated')
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .lte('date', format(endDate, 'yyyy-MM-dd'))
        .order('date', { ascending: true });

      if (error) throw error;

      const dateMap: { [key: string]: boolean } = {};
      data?.forEach(item => {
        dateMap[item.date] = item.is_modulated;
      });

      // Asegurar que todos los días del mes tengan un estado
      let currentDate = startDate;
      while (currentDate <= endDate) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        if (!dateMap.hasOwnProperty(dateStr)) {
          const { error: insertError } = await supabase
            .from('power_peaks')
            .insert([{
              date: dateStr,
              is_modulated: false,
              peak_time: '18:00:00',
              peak_value: 0
            }]);

          if (insertError) throw insertError;
          dateMap[dateStr] = false;
        }
        currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
      }

      setModulatedDates(dateMap);
    } catch (error) {
      console.error('Error fetching modulated dates:', error);
      toast.error('Error al cargar los estados de modulación');
    } finally {
      setLoading(false);
    }
  };

  const handleModulationChange = async (date: string, isModulated: boolean) => {
    try {
      const { error } = await supabase
        .from('power_peaks')
        .update({ is_modulated: isModulated })
        .eq('date', date);

      if (error) throw error;
      
      setModulatedDates(prev => ({
        ...prev,
        [date]: isModulated
      }));
      
      toast.success('Estado de modulación actualizado');
    } catch (error) {
      console.error('Error updating modulation status:', error);
      toast.error('Error al actualizar el estado de modulación');
    }
  };

  useEffect(() => {
    fetchModulatedDates();
    
    const interval = setInterval(() => {
      fetchModulatedDates();
    }, 12 * 60 * 60 * 1000); // Cada 12 horas

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gestión de Modulación</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ModulationCalendar 
          selectedDate={selectedDate}
          onSelectDate={(date) => date && setSelectedDate(date)}
          modulatedDates={modulatedDates}
        />
        <ModulationTable 
          modulatedDates={modulatedDates}
          onModulationChange={handleModulationChange}
        />
      </div>
    </div>
  );
};
