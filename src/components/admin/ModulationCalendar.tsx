
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ModulationDay {
  date: string;
  is_modulated: boolean;
}

export const ModulationCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [modulationData, setModulationData] = useState<ModulationDay[]>([]);

  const fetchModulationData = async () => {
    const startDate = startOfMonth(selectedDate);
    const endDate = endOfMonth(selectedDate);

    const { data, error } = await supabase
      .from('power_peaks')
      .select('date, is_modulated')
      .gte('date', format(startDate, 'yyyy-MM-dd'))
      .lte('date', format(endDate, 'yyyy-MM-dd'));

    if (error) {
      console.error('Error fetching modulation data:', error);
      return;
    }

    setModulationData(data || []);
  };

  useEffect(() => {
    fetchModulationData();
  }, [selectedDate]);

  const handleToggleModulation = async (date: string, currentValue: boolean) => {
    const currentTime = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    
    const { error } = await supabase
      .from('power_peaks')
      .upsert({
        date,
        is_modulated: !currentValue,
        peak_time: currentTime,
        peak_value: 0 // Valor por defecto, ajustar según necesidades
      });

    if (error) {
      toast.error('Error al actualizar la modulación');
      return;
    }

    fetchModulationData();
    toast.success('Modulación actualizada correctamente');
  };

  const getDateClassName = (date: Date): string => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const modulationDay = modulationData.find(d => d.date === dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date > today) {
      return "text-gray-400"; // Días futuros en gris
    }
    
    if (modulationDay?.is_modulated) {
      return "text-red-500 font-bold"; // Días modulados en rojo
    }
    
    return "text-green-500 font-bold"; // Días no modulados en verde
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          className="rounded-md border"
          classNames={{
            day_selected: "bg-sergen-50 text-sergen-900",
            day: getDateClassName
          }}
        />
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {modulationData
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((day) => (
                <TableRow key={day.date}>
                  <TableCell>{format(new Date(day.date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>
                    <span className={day.is_modulated ? "text-red-500" : "text-green-500"}>
                      {day.is_modulated ? "Modulado" : "No Modulado"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleModulation(day.date, day.is_modulated)}
                    >
                      Cambiar Estado
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
