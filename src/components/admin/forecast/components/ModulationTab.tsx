
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

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
        .lte('date', endOfMonth.toISOString())
        .order('date', { ascending: true });

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
    
    // Actualizar cada 15 minutos
    const interval = setInterval(() => {
      fetchModulatedDates();
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const formatDateUTC = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getUTCDate().toString().padStart(2, '0')}/${(date.getUTCMonth() + 1).toString().padStart(2, '0')}/${date.getUTCFullYear()}`;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gestión de Modulación</h2>
      <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-center">Estado de Modulación</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(modulatedDates).map(([date, isModulated]) => (
              <TableRow key={date}>
                <TableCell>{formatDateUTC(date)}</TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Switch
                      checked={isModulated}
                      onCheckedChange={(checked) => handleModulationChange(date, checked)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
