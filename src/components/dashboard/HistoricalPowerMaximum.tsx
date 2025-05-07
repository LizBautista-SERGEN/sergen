
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHistoricalPowerData } from "./historicalPower/useHistoricalPowerData";
import { HistoricalPowerChart } from "./historicalPower/HistoricalPowerChart";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const HistoricalPowerMaximum = () => {
  const { chartData, isLoading, error } = useHistoricalPowerData();
  const [dbStatus, setDbStatus] = useState<{loading: boolean, error?: string, count?: number}>({
    loading: true
  });

  // Try to verify Supabase connection and check if database is accessible
  useEffect(() => {
    const checkDbConnection = async () => {
      try {
        setDbStatus({loading: true});
        
        // Use a simpler query that should work
        const { data, error } = await supabase
          .from('coes_historical')
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.error('Error checking database connection:', error);
          setDbStatus({
            loading: false, 
            error: `Error de conexión a la base de datos: ${error.message}`
          });
        } else {
          console.log('Database connection verified, found count:', data);
          setDbStatus({
            loading: false,
            count: data?.length || 0
          });
        }
      } catch (err) {
        console.error('Error connecting to database:', err);
        setDbStatus({
          loading: false,
          error: `Error de conexión: ${err instanceof Error ? err.message : 'Desconocido'}`
        });
      }
    };

    checkDbConnection();
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span>Potencia Máxima (18:00 - 23:00)</span>
          <button
            onClick={handleRetry}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            title="Actualizar datos"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <p className="text-muted-foreground">Cargando datos...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64 flex-col">
            <div className="flex items-center text-red-500 mb-3">
              <AlertCircle className="h-5 w-5 mr-2" />
              <p className="font-medium">{error}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md w-full max-w-md">
              <h4 className="text-sm font-medium mb-2">Estado de la conexión:</h4>
              {dbStatus.loading ? (
                <p className="text-sm text-gray-500">Verificando conexión con la base de datos...</p>
              ) : dbStatus.error ? (
                <p className="text-sm text-red-500">{dbStatus.error}</p>
              ) : (
                <p className="text-sm text-gray-600">
                  Conexión a la base de datos correcta. {dbStatus.count !== undefined ? 
                  `Se encontraron ${dbStatus.count} registros en la tabla.` : ''}
                </p>
              )}
            </div>
            
            <button 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={handleRetry}
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
              Verifique que existen registros en la tabla coes_historical.
            </p>
            <button 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={handleRetry}
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
