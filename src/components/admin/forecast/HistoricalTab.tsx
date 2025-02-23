
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { HistoricalChart } from "./HistoricalChart";
import { useState } from "react";
import { ConsoleOutput } from "./ConsoleOutput";
import { UploadHistoricalData } from "./UploadHistoricalData";
import { HistoricalDatePicker } from "./components/HistoricalDatePicker";
import { Button } from "@/components/ui/button";

export const HistoricalTab = () => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [lastError, setLastError] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success('Datos actualizados correctamente');
    } catch (error) {
      toast.error('Error al actualizar los datos');
      console.error('Error al refrescar datos:', error);
    } finally {
      setIsRefreshing(false);
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
      
      <div className="flex justify-between items-center">
        <HistoricalDatePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
        <Button
          onClick={handleRefresh}
          variant="outline"
          disabled={isRefreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Actualizando...' : 'Actualizar Datos'}
        </Button>
      </div>

      {lastError && (
        <ConsoleOutput error={lastError} />
      )}

      <div className="grid grid-cols-1 gap-6">
        {historicalData && historicalData.length > 0 ? (
          <div className="bg-white p-4 rounded-lg shadow h-[600px]">
            <HistoricalChart 
              data={historicalData}
              startDate={startDate}
              endDate={endDate}
            />
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No hay datos históricos disponibles. Sube un archivo Excel para comenzar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
