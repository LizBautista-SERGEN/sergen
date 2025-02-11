import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from "sonner";

interface EnergyData {
  id: string;
  date: string;
  time: string;
  forecasted_power: number;
  executed_power: number;
  consumption: number;
  demand: number;
  cost: number;
  is_modulated: boolean;
}

export const EnergyManagement = () => {
  const [energyData, setEnergyData] = useState<EnergyData[]>([]);

  const fetchEnergyData = async () => {
    const { data, error } = await supabase
      .from('energy_data')
      .select('*')
      .order('date', { ascending: false })
      .order('time', { ascending: true });

    if (error) {
      toast.error('Error al cargar datos de energía');
      return;
    }

    setEnergyData(data || []);
  };

  const handleUploadEnergyData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { error } = await supabase.functions.invoke('upload-energy-data', {
        body: formData,
      });

      if (error) throw error;

      toast.success('Datos subidos exitosamente');
      fetchEnergyData();
    } catch (error) {
      toast.error('Error al subir datos');
      console.error('Error:', error);
    }
  };

  const handleToggleModulation = async (id: string, isModulated: boolean) => {
    const { error } = await supabase
      .from('energy_data')
      .update({ is_modulated: !isModulated })
      .eq('id', id);

    if (error) {
      toast.error('Error al actualizar estado de modulación');
      return;
    }

    toast.success('Estado de modulación actualizado');
    fetchEnergyData();
  };

  const getChartData = (date: string) => {
    return energyData
      .filter(data => data.date === date)
      .map(data => ({
        time: data.time,
        "Potencia Pronosticada": data.forecasted_power,
        "Potencia Ejecutada": data.executed_power
      }));
  };

  const uniqueDates = [...new Set(energyData.map(data => data.date))];
  const latestDate = uniqueDates[0] || format(new Date(), 'yyyy-MM-dd');
  const chartData = getChartData(latestDate);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Subir Datos de Energía</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleUploadEnergyData}
              className="hidden"
              id="energy-data-upload"
            />
            <Label
              htmlFor="energy-data-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="h-12 w-12 text-gray-400 mb-4" />
              <span className="text-gray-600">
                Click para subir archivo de datos de energía
              </span>
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vista Previa del Pronóstico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select defaultValue={latestDate}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar fecha" />
              </SelectTrigger>
              <SelectContent>
                {uniqueDates.map((date) => (
                  <SelectItem key={date} value={date}>
                    {format(new Date(date), 'dd/MM/yyyy', { locale: es })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="Potencia Pronosticada"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Potencia Ejecutada"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Datos de Energía</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Potencia Pronosticada</TableHead>
                <TableHead>Potencia Ejecutada</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {energyData.map((data) => (
                <TableRow key={data.id}>
                  <TableCell>{format(new Date(data.date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{data.time}</TableCell>
                  <TableCell>{data.forecasted_power} kW</TableCell>
                  <TableCell>{data.executed_power} kW</TableCell>
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
