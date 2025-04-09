
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, isAfter, isSameDay, startOfMonth, endOfMonth, addMonths, parseISO, startOfYear } from "date-fns";
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
  const [selectedMonth, setSelectedMonth] = useState<Date>(startOfYear(new Date(2025, 0, 1))); // Start from January 2025
  const [modulationData, setModulationData] = useState<ModulationDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDayData, setSelectedDayData] = useState<ModulationDay | null>(null);

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
  };

  useEffect(() => {
    fetchModulationData(selectedMonth);
  }, [selectedMonth]);

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
      // The RLS error indicates we need to ensure we have the right permissions
      // Since we're not using auth in this part of the app, we'll use a less restrictive approach

      const { error } = await supabase
        .from('modulation_days')
        .upsert({
          date: dateStr,
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

  // Fix: Create a custom function for the disabled prop that takes a single Date parameter
  const isDateInFuture = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return isAfter(date, today);
  };

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
          onSelect={(date) => {
            if (date && !isAfter(date, new Date())) {
              setSelectedDate(date);
            }
          }}
          month={selectedMonth}
          onMonthChange={setSelectedMonth}
          className="rounded-md border"
          disabled={isDateInFuture}
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
        <h3 className="text-lg font-semibold mb-4">Modulación del día seleccionado</h3>
        {selectedDate && !isAfter(selectedDate, new Date()) ? (
          <div className="flex items-center justify-between px-4 py-3 border rounded-md">
            <div>
              <p className="font-medium">Fecha: {format(selectedDate, 'dd/MM/yyyy')}</p>
              <p className={selectedDayData?.is_modulated ? "text-red-500 font-medium" : "text-green-500 font-medium"}>
                Estado: {selectedDayData?.is_modulated ? "Modulado" : "No Modulado"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={selectedDayData?.is_modulated ? "text-red-500" : "text-green-500"}>
                {selectedDayData?.is_modulated ? "Modulado" : "No Modulado"}
              </span>
              <Switch
                checked={selectedDayData?.is_modulated || false}
                onCheckedChange={() => handleToggleModulation(selectedDate, selectedDayData?.is_modulated || false)}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 text-amber-600 bg-amber-50 rounded-md">
            <AlertTriangle className="h-5 w-5" />
            <p>Seleccione un día pasado o el día actual para ver y modificar su estado de modulación.</p>
          </div>
        )}
        <div className="flex items-center gap-2 mt-4 text-amber-600 bg-amber-50 p-3 rounded-md">
          <AlertTriangle className="h-5 w-5" />
          <p className="text-sm">No se puede modificar el estado de modulación de días futuros.</p>
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
                .filter(day => !isAfter(parseISO(day.date), new Date()))
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
