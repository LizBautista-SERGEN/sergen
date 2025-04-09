
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, isAfter, isSameDay, startOfMonth, endOfMonth, addMonths, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

interface ModulationDay {
  date: string;
  is_modulated: boolean;
}

export const ModulationTab = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [modulationData, setModulationData] = useState<ModulationDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [todayData, setTodayData] = useState<ModulationDay | null>(null);

  const fetchModulationData = async (month: Date) => {
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
      
      // Get today's data
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = data?.find(d => d.date === today) || null;
      setTodayData(todayRecord);
    } catch (error) {
      console.error('Error en fetchModulationData:', error);
      toast.error('Error al cargar los datos de modulación');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModulationData(selectedMonth);
  }, [selectedMonth]);

  const handleToggleModulation = async (currentValue: boolean) => {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const { error } = await supabase
        .from('modulation_days')
        .upsert({
          date: today,
          is_modulated: !currentValue
        });

      if (error) {
        console.error('Error al actualizar modulación:', error);
        toast.error('Error al actualizar la modulación');
        return;
      }

      fetchModulationData(selectedMonth);
      toast.success('Modulación actualizada correctamente');
    } catch (error) {
      console.error('Error en handleToggleModulation:', error);
      toast.error('Error al actualizar la modulación');
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

  const isDayModulated = (date: string): boolean => {
    const record = modulationData.find(d => d.date === date);
    return record?.is_modulated || false;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = format(today, 'yyyy-MM-dd');
  const isModulated = isDayModulated(todayStr);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-4">
        <Button 
          variant="outline" 
          onClick={() => handleMonthChange(false)}
        >
          Mes Anterior
        </Button>
        <h2 className="text-xl font-bold">
          {format(selectedMonth, 'MMMM yyyy')}
        </h2>
        <Button 
          variant="outline" 
          onClick={() => handleMonthChange(true)}
        >
          Mes Siguiente
        </Button>
      </div>

      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && isSameDay(date, today) && setSelectedDate(date)}
          month={selectedMonth}
          onMonthChange={setSelectedMonth}
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

      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Modulación del día actual</h3>
        <div className="flex items-center justify-between px-4 py-3 border rounded-md">
          <div>
            <p className="font-medium">Fecha: {format(today, 'dd/MM/yyyy')}</p>
            <p className={isModulated ? "text-red-500 font-medium" : "text-green-500 font-medium"}>
              Estado: {isModulated ? "Modulado" : "No Modulado"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={isModulated ? "text-red-500" : "text-green-500"}>
              {isModulated ? "Modulado" : "No Modulado"}
            </span>
            <Switch
              checked={isModulated}
              onCheckedChange={() => handleToggleModulation(isModulated)}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 text-amber-600 bg-amber-50 p-3 rounded-md">
          <AlertTriangle className="h-5 w-5" />
          <p className="text-sm">Solo se puede modificar el estado de modulación del día actual.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Leyenda</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm">Con modulación</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm">Sin modulación</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span className="text-sm">Días futuros (no seleccionables)</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-white p-4 rounded-lg border shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Historial de modulación</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center">
                  Cargando datos...
                </TableCell>
              </TableRow>
            ) : (
              modulationData
                .filter(day => !isAfter(parseISO(day.date), today))
                .map((day) => (
                  <TableRow key={day.date}>
                    <TableCell>{format(new Date(day.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      <span className={day.is_modulated ? "text-red-500 font-medium" : "text-green-500 font-medium"}>
                        {day.is_modulated ? "Modulado" : "No Modulado"}
                      </span>
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
