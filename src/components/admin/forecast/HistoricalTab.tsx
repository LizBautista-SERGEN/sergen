
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { HistoricalChart } from "./HistoricalChart";
import { useState } from "react";
import { ConsoleOutput } from "./ConsoleOutput";
import { UploadHistoricalData } from "./UploadHistoricalData";
import { HistoricalHeader } from "./components/HistoricalHeader";
import { HistoricalDataTable } from "./components/HistoricalDataTable";

export const HistoricalTab = () => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [lastError, setLastError] = useState<any>(null);

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
      
      if (response.error) {
        setLastError(response.error);
        throw new Error(response.error.message || 'Error desconocido');
      }
      
      if (response.data?.success) {
        toast.success(`Datos actualizados correctamente (${response.data.count} registros)`);
        refetch();
      } else {
        throw new Error('Error al actualizar los datos');
      }
    } catch (error: any) {
      console.error('Error completo:', error);
      setLastError(error);
      toast.error(`Error al actualizar los datos históricos: ${error.message}`);
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
      <UploadHistoricalData />
      
      <HistoricalHeader
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onUpdateData={updateHistoricalData}
        historicalData={historicalData}
      />

      {lastError && (
        <ConsoleOutput error={lastError} />
      )}

      <div className="grid grid-cols-1 gap-6">
        {historicalData && historicalData.length > 0 ? (
          <>
            <div className="bg-white p-4 rounded-lg shadow h-[400px]">
              <HistoricalChart 
                data={historicalData}
                startDate={startDate}
                endDate={endDate}
              />
            </div>
            <HistoricalDataTable data={historicalData} />
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No hay datos históricos disponibles. Selecciona un rango de fechas y haz clic en "Actualizar Datos".
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
