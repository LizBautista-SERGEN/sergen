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
    }, 12 * 60 * 60 * 1000);

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
              fixedWeeks
              modifiers={{
                modulated: (date) => isDateModulated(date),
                notModulated: (date) => !isDateModulated(date),
                current: (date) => isSameDay(date, new Date())
              }}
              modifiersStyles={{
                modulated: { 
                  color: "#C00000",
                  backgroundColor: "transparent"
                },
                notModulated: { 
                  color: "#34D399",
                  backgroundColor: "transparent"
                },
                current: {
                  fontWeight: "bold",
                  border: "2px solid #FEC6A1",
                  backgroundColor: "transparent"
                }
              }}
            />
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="text-[#C00000]">●</div>
                <span className="text-sm">Con modulación</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-[#34D399]">●</div>
                <span className="text-sm">Sin modulación</span>
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
