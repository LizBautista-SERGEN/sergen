
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const ModulationTab = () => {
  const [modulatedDates, setModulatedDates] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(false);

  const fetchModulatedDates = async () => {
    try {
      setLoading(true);
      const startOfMonth = new Date();
      startOfMonth.setUTCDate(1);
      startOfMonth.setUTCHours(0, 0, 0, 0);

      const endOfMonth = new Date();
      endOfMonth.setUTCMonth(endOfMonth.getUTCMonth() + 1, 0);
      endOfMonth.setUTCHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('power_peaks')
        .select('date, is_modulated')
        .gte('date', startOfMonth.toISOString())
        .lte('date', endOfMonth.toISOString());

      if (error) throw error;

      const dateMap: { [key: string]: boolean } = {};
      data?.forEach(item => {
        dateMap[item.date] = item.is_modulated;
      });
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
    
    // Actualizar cada 12 horas
    const interval = setInterval(() => {
      fetchModulatedDates();
    }, 12 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gestión de Modulación</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(modulatedDates).map(([date, isModulated]) => (
          <div key={date} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
            <span>{new Date(date).toLocaleDateString('es-ES')}</span>
            <Switch
              checked={isModulated}
              onCheckedChange={(checked) => handleModulationChange(date, checked)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
