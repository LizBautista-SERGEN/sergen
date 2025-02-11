
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, isSameDay, isSameMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from "sonner";

interface DailyPowerData {
  id: string;
  date: string;
  max_power: number;
  is_modulated: boolean;
  peak_hour: string;
}

export const DailyPowerManagement = () => {
  const [dailyPowerData, setDailyPowerData] = useState<DailyPowerData[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const fetchDailyPowerData = async () => {
    const { data, error } = await supabase
      .from('daily_power_data')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      toast.error('Error al cargar datos de potencia diaria');
      return;
    }

    setDailyPowerData(data || []);
  };

  useEffect(() => {
    fetchDailyPowerData();
  }, []);

  const handleToggleModulation = async (id: string, isModulated: boolean) => {
    const { error } = await supabase
      .from('daily_power_data')
      .update({ is_modulated: !isModulated })
      .eq('id', id);

    if (error) {
      toast.error('Error al actualizar estado de modulación');
      return;
    }

    toast.success('Estado de modulación actualizado');
    fetchDailyPowerData();
  };

  const getBarChartData = () => {
    if (!selectedDate) return [];

    const currentMonthData = dailyPowerData.filter(data => {
      const dataDate = new Date(data.date);
      return isSameMonth(dataDate, selectedDate);
    });

    const data = currentMonthData.map(data => ({
      date: format(new Date(data.date), 'dd/MM'),
      fullDate: new Date(data.date),
      value: data.max_power || 0,
      selected: selectedDate && isSameDay(new Date(data.date), selectedDate)
    }));

    const sortedData = [...data].sort((a, b) => b.value - a.value);
    const maxValue = sortedData[0]?.value;
    const secondMaxValue = sortedData[1]?.value;

    return data.map(item => ({
      ...item,
      color: item.value === maxValue ? '#C00000' : 
             item.value === secondMaxValue ? '#f39200' : 
             '#156082'
    }));
  };

  const CustomBackground = ({ x, width, selected }: any) => {
    if (!selected) return null;
    
    return (
      <rect
        x={x - 2}
        y={0}
        width={width + 4}
        height={300}
        fill="rgba(128, 128, 128, 0.1)"
      />
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Histórico Diario de Potencia Máxima</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getBarChartData()}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} kW`, 'Potencia']}
                  labelFormatter={(label) => `Fecha: ${label}`}
                />
                {getBarChartData().map((entry, index) => (
                  <CustomBackground
                    key={`background-${index}`}
                    x={index * (650 / getBarChartData().length)}
                    width={650 / getBarChartData().length}
                    selected={entry.selected}
                  />
                ))}
                <Bar dataKey="value">
                  {getBarChartData().map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <Table className="mt-6">
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Hora Punta</TableHead>
                <TableHead>Potencia Máxima</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dailyPowerData.map((data) => (
                <TableRow key={data.id}>
                  <TableCell>{format(new Date(data.date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{data.peak_hour}</TableCell>
                  <TableCell>{data.max_power} kW</TableCell>
                  <TableCell>
                    {data.is_modulated ? 'Modulado' : 'No Modulado'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      onClick={() => handleToggleModulation(data.id, data.is_modulated)}
                    >
                      {data.is_modulated ? 'Desactivar Modulación' : 'Activar Modulación'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
