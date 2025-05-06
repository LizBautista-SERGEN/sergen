
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHistoricalPowerData } from "./historicalPower/useHistoricalPowerData";
import { HistoricalPowerChart } from "./historicalPower/HistoricalPowerChart";
import { Loader2 } from "lucide-react";

export const HistoricalPowerMaximum = () => {
  const { chartData, isLoading, error } = useHistoricalPowerData();

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
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
              Revise la consola del navegador para más detalles sobre el error.
            </p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-64 flex-col">
            <p className="text-muted-foreground">
              No hay datos disponibles en el rango horario de 18:00 a 23:00
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Verifique la conexión con la base de datos o si existen registros en la tabla coes_historical.
            </p>
          </div>
        ) : (
          <HistoricalPowerChart chartData={chartData} />
        )}
      </CardContent>
    </Card>
  );
};
