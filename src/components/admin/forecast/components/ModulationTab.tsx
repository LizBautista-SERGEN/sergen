
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { format, isSameDay, isAfter, isFuture, isPast, startOfMonth, endOfMonth, isBefore } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const ModulationTab = () => {
  const [modulatedDates, setModulatedDates] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

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

      // Asegurarse de que el día actual esté en la tabla
      const today = new Date();
      const todayStr = format(today, 'yyyy-MM-dd');
      if (!dateMap.hasOwnProperty(todayStr)) {
        const { error: insertError } = await supabase
          .from('power_peaks')
          .insert([{
            date: todayStr,
            is_modulated: false,
            peak_time: '18:00:00', // Hora por defecto
            peak_value: 0 // Valor por defecto
          }]);

        if (insertError) throw insertError;
        dateMap[todayStr] = false;
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

  const isDateModulated = (date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return modulatedDates[dateStr] || false;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gestión de Modulación</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Calendario de Modulación</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
              locale={es}
              modifiers={{
                future: (date) => isFuture(date),
                modulated: (date) => !isFuture(date) && isDateModulated(date),
                notModulated: (date) => !isFuture(date) && !isDateModulated(date),
                current: (date) => isSameDay(date, new Date())
              }}
              modifiersStyles={{
                future: { color: "#8E9196" },
                modulated: { 
                  color: "white",
                  backgroundColor: "#C00000"
                },
                notModulated: { 
                  color: "white",
                  backgroundColor: "#34D399"
                },
                current: {
                  fontWeight: "bold",
                  border: "2px solid #FEC6A1"
                }
              }}
              fromDate={startOfMonth(new Date())}
              toDate={endOfMonth(new Date())}
            />
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#C00000]"></div>
                <span className="text-sm">Con modulación</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#34D399]"></div>
                <span className="text-sm">Sin modulación</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#8E9196]"></div>
                <span className="text-sm">Días futuros</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tabla de Modulación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-center">Estado de Modulación</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(modulatedDates)
                    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
                    .map(([date, isModulated]) => (
                      <TableRow key={date}>
                        <TableCell>{formatDateUTC(date)}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <Switch
                              checked={isModulated}
                              onCheckedChange={(checked) => handleModulationChange(date, checked)}
                              disabled={isFuture(new Date(date))}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
