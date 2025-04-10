
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, isAfter, isSameDay, startOfMonth, endOfMonth, addMonths, parseISO, startOfYear } from "date-fns";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AlertTriangle, Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { es } from "date-fns/locale";

interface ModulationDay {
  date: string;
  is_modulated: boolean;
}

export const ModulationTab = () => {
  const today = new Date();
  const startDate = startOfYear(new Date(2025, 0, 1)); // January 2025
  
  const [selectedDate, setSelectedDate] = useState<Date>(today > startDate ? today : startDate);
  const [selectedMonth, setSelectedMonth] = useState<Date>(startDate); // Start from January 2025
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
      const { error } = await supabase
        .from('modulation_days')
        .upsert([{
          date: dateStr,
          is_modulated: !currentValue
        }]);

      if (error) {
        console.error('Error al actualizar modulación:', error);
        toast.error('Error al actualizar la modulación');
        return;
      }

      await fetchModulationData(selectedMonth);
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

  // Custom function for the disabled prop that takes a single date parameter
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
          {format(selectedMonth, 'MMMM yyyy', { locale: es })}
        </h2>
        <Button 
          variant="outline" 
          onClick={() => handleMonthChange(true)}
        >
          Mes Siguiente
        </Button>
      </div>

      <div className="flex justify-between gap-6">
        <div className="w-1/2">
          <div className="bg-white p-4 rounded-lg border shadow-sm mb-4">
            <h3 className="text-lg font-semibold mb-4">Seleccionar Fecha</h3>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: es }) : "Seleccione una fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  month={selectedMonth}
                  onMonthChange={setSelectedMonth}
                  disabled={isDateInFuture}
                  initialFocus
                  fromDate={startDate}
                  locale={es}
                  components={{
                    Day: ({ date }) => (
                      <div className={cn(getDateClassName(date))}>
                        {date.getDate()}
                      </div>
                    )
                  }}
                  className="rounded-md border p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Modulación del día seleccionado</h3>
            {selectedDate && !isDateInFuture(selectedDate) ? (
              <div className="flex items-center justify-between px-4 py-3 border rounded-md">
                <div>
                  <p className="font-medium">Fecha: {format(selectedDate, 'dd/MM/yyyy', { locale: es })}</p>
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
        </div>

        <div className="w-1/2">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              month={selectedMonth}
              onMonthChange={setSelectedMonth}
              className="rounded-md border w-full pointer-events-auto"
              disabled={isDateInFuture}
              fromDate={startDate}
              locale={es}
              components={{
                Day: ({ date }) => (
                  <div className={cn(getDateClassName(date))}>
                    {date.getDate()}
                  </div>
                )
              }}
            />
          </div>

          <div className="bg-white p-4 rounded-lg border shadow-sm mt-4">
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
        </div>
      </div>

      <div className="overflow-x-auto bg-white p-4 rounded-lg border shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Tabla de Modulación - {format(selectedMonth, 'MMMM yyyy', { locale: es })}</h3>
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
            ) : modulationData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  No hay datos disponibles para este mes
                </TableCell>
              </TableRow>
            ) : (
              modulationData
                .filter(day => !isDateInFuture(new Date(day.date)))
                .map((day) => (
                  <TableRow key={day.date} className={day.is_modulated ? "bg-red-50" : "bg-green-50"}>
                    <TableCell>{format(new Date(day.date), 'dd/MM/yyyy', { locale: es })}</TableCell>
                    <TableCell>
                      <span className={day.is_modulated ? "text-red-500 font-medium" : "text-green-500 font-medium"}>
                        {day.is_modulated ? "Modulado" : "No Modulado"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const date = new Date(day.date);
                          handleToggleModulation(date, day.is_modulated);
                        }}
                      >
                        Cambiar a {day.is_modulated ? "No Modulado" : "Modulado"}
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
