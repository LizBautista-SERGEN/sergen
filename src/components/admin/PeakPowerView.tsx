
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format } from 'date-fns';
import { toast } from "sonner";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ExportDataDialog } from "./ExportDataDialog";

interface PeakPowerData {
  id: number;
  date: string;
  max_power: number;
  is_modulated: boolean;
}

export const PeakPowerView = () => {
  const [peakPowerData, setPeakPowerData] = useState<PeakPowerData[]>([]);
  const { isSuperUser } = useUserProfile();

  const fetchPeakPowerData = async () => {
    try {
      const { data, error } = await supabase
        .from('peak_power')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      setPeakPowerData(data || []);
    } catch (error) {
      console.error('Error fetching peak power data:', error);
      toast.error('Error al obtener datos de potencia');
    }
  };

  const toggleModulation = async (id: number, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('peak_power')
        .update({ is_modulated: !currentValue })
        .eq('id', id);

      if (error) throw error;

      await fetchPeakPowerData();
      toast.success('Estado de modulación actualizado');
    } catch (error) {
      console.error('Error updating modulation:', error);
      toast.error('Error al actualizar estado de modulación');
    }
  };

  useEffect(() => {
    fetchPeakPowerData();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Potencia Máxima en Hora Punta</h2>
          <ExportDataDialog 
            data={peakPowerData}
            filename={`potencia-maxima-${format(new Date(), 'yyyyMMdd')}`}
          />
        </div>

        {peakPowerData.length > 0 && (
          <div className="space-y-6">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={peakPowerData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => format(new Date(value), 'dd/MM')}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(label) => format(new Date(label), 'dd/MM/yyyy')}
                    formatter={(value: any) => [`${value.toLocaleString()} MW`, '']}
                  />
                  <Bar dataKey="max_power" name="Potencia Máxima">
                    {peakPowerData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.is_modulated ? '#ef4444' : '#22c55e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Potencia Máxima (MW)</TableHead>
                  <TableHead>Estado</TableHead>
                  {isSuperUser && <TableHead>Acciones</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {peakPowerData.map((data) => (
                  <TableRow key={data.id}>
                    <TableCell>
                      {format(new Date(data.date), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      {data.max_power.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        data.is_modulated ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {data.is_modulated ? 'Modulado' : 'No Modulado'}
                      </span>
                    </TableCell>
                    {isSuperUser && (
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleModulation(data.id, data.is_modulated)}
                        >
                          {data.is_modulated ? 'Desmodular' : 'Modular'}
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};
