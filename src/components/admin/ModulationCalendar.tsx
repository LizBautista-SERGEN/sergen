
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ModulationDay {
  date: string;
  is_modulated: boolean;
}

export const ModulationCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [modulationData, setModulationData] = useState<ModulationDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchModulationData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('modulation_days')
        .select('date, is_modulated')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error al cargar datos de modulación:', error);
        toast.error("Error al cargar datos de modulación");
        return;
      }

      setModulationData(data || []);
    } catch (error) {
      console.error('Error en fetchModulationData:', error);
      toast.error('Error al cargar los datos de modulación');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModulationData();
  }, []);

  const handleToggleModulation = async (date: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('modulation_days')
        .upsert({
          date,
          is_modulated: !currentValue
        });

      if (error) {
        console.error('Error al actualizar modulación:', error);
        toast.error('Error al actualizar la modulación');
        return;
      }

      fetchModulationData();
      toast.success('Modulación actualizada correctamente');
    } catch (error) {
      console.error('Error en handleToggleModulation:', error);
      toast.error('Error al actualizar la modulación');
    }
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
    
    return "text-green-500"; // Días no modulados en verde
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          className="rounded-md border"
          components={{
            Day: ({ date }) => (
              <div className={cn(getDateClassName(date))}>
                {date.getDate()}
              </div>
            )
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  Cargando datos...
                </TableCell>
              </TableRow>
            ) : (
              modulationData.map((day) => (
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
