
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Upload } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { ExportDataDialog } from "../ExportDataDialog";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ConsoleOutput } from "./ConsoleOutput";
import { HistoricalChart } from "./HistoricalChart";

export const HistoricalTab = () => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [lastError, setLastError] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: historicalData, isLoading, refetch } = useQuery({
    queryKey: ['historical-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coes_historical')
        .select('*')
        .order('fecha', { ascending: true });

      if (error) {
        console.error('Error fetching historical data:', error);
        toast.error('Error al cargar los datos históricos');
        throw error;
      }

      return data;
    }
  });

  const updateHistoricalData = async () => {
    if (!startDate || !endDate) {
      toast.error('Por favor selecciona las fechas de inicio y fin');
      return;
    }

    try {
      setLastError(null);
      console.log('Iniciando actualización de datos históricos...');
      console.log('Fechas seleccionadas:', {
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd')
      });

      const response = await supabase.functions.invoke('get-coes-historical', {
        body: {
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd')
        }
      });
      
      console.log('Respuesta completa de la función:', response);

      if (response.error) {
        setLastError(response.error);
        throw new Error(response.error.message || 'Error desconocido');
      }
      
      if (response.data?.success) {
        toast.success(`Datos actualizados correctamente (${response.data.count} registros)`);
        refetch();
      } else {
        console.error('Respuesta inesperada:', response);
        throw new Error('Error al actualizar los datos');
      }
    } catch (error: any) {
      console.error('Error completo:', error);
      setLastError(error);
      toast.error(`Error al actualizar los datos históricos: ${error.message}`);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Por favor selecciona un archivo Excel (.xlsx o .xls)');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const { error } = await supabase.functions.invoke('upload-historical-data', {
        body: formData
      });

      if (error) throw error;

      toast.success('Datos históricos actualizados correctamente');
      refetch();
    } catch (error: any) {
      console.error('Error al subir archivo:', error);
      toast.error('Error al procesar el archivo: ' + error.message);
    } finally {
      setIsUploading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <h3 className="font-semibold mb-2">Subir Datos Históricos</h3>
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
            id="excel-upload"
            disabled={isUploading}
          />
          <label htmlFor="excel-upload">
            <Button 
              variant="outline" 
              disabled={isUploading}
              className="cursor-pointer"
              asChild
            >
              <span>
                <Upload className="mr-2 h-4 w-4" />
                {isUploading ? 'Subiendo...' : 'Seleccionar Excel'}
              </span>
            </Button>
          </label>
          <p className="text-sm text-gray-500">
            Formatos soportados: .xlsx, .xls
          </p>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Datos Históricos</h2>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  {startDate ? format(startDate, "PP") : "Fecha inicial"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  {endDate ? format(endDate, "PP") : "Fecha final"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button 
            onClick={updateHistoricalData} 
            disabled={!startDate || !endDate}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar Datos
          </Button>

          {historicalData && historicalData.length > 0 && (
            <ExportDataDialog 
              data={historicalData} 
              filename="datos-historicos" 
              chartComponent={<HistoricalChart data={historicalData} />}
            />
          )}
        </div>
      </div>

      {lastError && (
        <ConsoleOutput error={lastError} />
      )}

      <div className="grid grid-cols-1 gap-6">
        {historicalData && historicalData.length > 0 ? (
          <>
            <div className="bg-white p-4 rounded-lg shadow h-[400px]">
              <HistoricalChart data={historicalData} />
            </div>
            <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Demanda Programada
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reprogramación Diaria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prog. Semanal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ejecutado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {historicalData.map((row) => (
                    <tr key={row.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {format(new Date(row.fecha), 'dd/MM/yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {row.demanda_programada?.toLocaleString() || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {row.reprogramacion_diaria?.toLocaleString() || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {row.prog_semanal?.toLocaleString() || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {row.ejecutado?.toLocaleString() || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No hay datos históricos disponibles. Selecciona un rango de fechas y haz clic en "Actualizar Datos" o sube un archivo Excel.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
