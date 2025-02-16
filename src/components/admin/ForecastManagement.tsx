
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { format, subDays } from 'date-fns';
import { toast } from "sonner";
import { Loader2, Calendar } from "lucide-react";
import { ExportDataDialog } from "./ExportDataDialog";
import { ForecastChart } from "./forecast/ForecastChart";
import { ForecastTable } from "./forecast/ForecastTable";
import { Input } from "@/components/ui/input";

export const ForecastManagement = () => {
  const [loadingCoes, setLoadingCoes] = useState(false);
  const [coesData, setCoesData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 3), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(subDays(new Date(), 1), 'yyyy-MM-dd'));

  const fetchCoesData = useCallback(async () => {
    setLoadingCoes(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No hay sesión activa');
      }

      console.log('Iniciando llamada a función Edge...');
      
      const { data, error: functionError } = await supabase.functions.invoke('get-coes-data', {
        method: 'POST',
        body: {
          startDate,
          endDate
        },
      });

      if (functionError) {
        console.error('Error en la función:', functionError);
        throw new Error(functionError.message);
      }

      if (!Array.isArray(data)) {
        console.error('Respuesta inválida:', data);
        throw new Error('Formato de respuesta inválido');
      }

      if (data.length === 0) {
        setError('No se encontraron datos disponibles');
        toast.warning('No se encontraron datos disponibles');
      } else {
        setCoesData(data);
        setLastUpdate(new Date());
        console.log('Datos de COES actualizados:', data);
        toast.success('Datos actualizados correctamente');
      }
      
    } catch (error: any) {
      console.error('Error al consultar COES:', error);
      const errorMessage = error.message || 'Error desconocido';
      setError(`Error al obtener datos de COES: ${errorMessage}`);
      toast.error(`Error al obtener datos de COES: ${errorMessage}`);
      
      if (errorMessage.includes('sesión')) {
        supabase.auth.signOut();
        window.location.href = '/login';
      }
    } finally {
      setLoadingCoes(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchCoesData();
  }, [fetchCoesData]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col space-y-4 rounded-lg border p-6 bg-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Pronóstico de Demanda</h2>
            <p className="text-sm text-gray-500">
              Última actualización: {format(lastUpdate, 'dd/MM/yyyy HH:mm:ss')}
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium mb-1">Desde:</label>
                <Calendar className="absolute top-9 left-3 h-4 w-4 text-gray-500" />
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-9"
                  max={endDate}
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-medium mb-1">Hasta:</label>
                <Calendar className="absolute top-9 left-3 h-4 w-4 text-gray-500" />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-9"
                  min={startDate}
                  max={format(subDays(new Date(), 1), 'yyyy-MM-dd')}
                />
              </div>
            </div>
            <Button 
              onClick={fetchCoesData} 
              disabled={loadingCoes}
              variant="outline"
            >
              {loadingCoes ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : 'Actualizar datos'}
            </Button>
            <ExportDataDialog 
              data={coesData}
              filename={`pronostico-demanda-${format(new Date(), 'yyyyMMdd')}`}
              chartComponent={<ForecastChart data={coesData} forPDF={true} />}
            />
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm mt-2">
            {error}
          </div>
        )}

        {coesData.length > 0 && (
          <div className="mt-4 space-y-6">
            <div className="h-[400px] w-full bg-white rounded-lg p-4 shadow">
              <ForecastChart data={coesData} />
            </div>

            <ForecastTable data={coesData} />
          </div>
        )}
      </div>
    </div>
  );
};
