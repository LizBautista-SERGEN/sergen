
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHistoricalPowerData } from "./historicalPower/useHistoricalPowerData";
import { HistoricalPowerChart } from "./historicalPower/HistoricalPowerChart";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const HistoricalPowerMaximum = () => {
  const { chartData, isLoading, error } = useHistoricalPowerData();

  // Try to verify Supabase connection and check if database is accessible
  useEffect(() => {
    const checkDbConnection = async () => {
      try {
        const { data, error } = await supabase.from('coes_historical').select('count(*)');
        if (error) {
          console.error('Error checking database connection:', error);
        } else {
          console.log('Database connection verified, found count:', data);
        }
      } catch (err) {
        console.error('Error connecting to database:', err);
      }
    };

    checkDbConnection();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle>Potencia Máxima (18:00 - 23:00)</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <p className="text-muted-foreground">Cargando datos...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64 flex-col">
            <p className="text-red-500 mb-2">{error}</p>
            <p className="text-sm text-gray-500">
              Verifique la conexión con la base de datos o si existen registros en la tabla coes_historical.
            </p>
            <button 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </button>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-64 flex-col">
            <p className="text-muted-foreground">
              No hay datos disponibles en el rango horario de 18:00 a 23:00
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Verifique la conexión con la base de datos o si existen registros en la tabla coes_historical.
            </p>
            <button 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </button>
          </div>
        ) : (
          <HistoricalPowerChart chartData={chartData} />
        )}
      </CardContent>
    </Card>
  );
};
