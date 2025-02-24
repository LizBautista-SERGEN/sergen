
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { ExportDataDialog } from "../ExportDataDialog";

interface HistoricalDataFetcherProps {
  onDataFetched?: (data: any) => void;
}

export const HistoricalDataFetcher = ({ onDataFetched }: HistoricalDataFetcherProps) => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const { data: historicalData, isLoading, refetch } = useQuery({
    queryKey: ['historical-data', startDate, endDate],
    queryFn: async () => {
      if (!startDate || !endDate) return null;
      
      // Aquí llamarías a tu API con las fechas seleccionadas
      // Por ahora retornamos datos de ejemplo
      const response = await fetch('/api/historical-data', {
        method: 'POST',
        body: JSON.stringify({
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd')
        })
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener datos históricos');
      }
      
      const data = await response.json();
      onDataFetched?.(data);
      return data;
    },
    enabled: false // No se ejecuta automáticamente
  });

  const handleFetchData = async () => {
    if (!startDate || !endDate) {
      toast.error("Por favor selecciona ambas fechas");
      return;
    }

    if (startDate > endDate) {
      toast.error("La fecha inicial debe ser anterior a la fecha final");
      return;
    }

    try {
      await refetch();
      toast.success("Datos obtenidos exitosamente");
    } catch (error) {
      toast.error("Error al obtener los datos históricos");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Fecha Inicial</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : "Seleccionar fecha"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Fecha Final</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : "Seleccionar fecha"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-end gap-2">
          <Button 
            onClick={handleFetchData} 
            disabled={isLoading || !startDate || !endDate}
          >
            {isLoading ? "Cargando..." : "Obtener Datos"}
          </Button>
          
          {historicalData && (
            <ExportDataDialog
              data={historicalData}
              filename={`datos-historicos-${format(new Date(), 'yyyy-MM-dd')}`}
            />
          )}
        </div>
      </div>

      {historicalData && (
        <div className="mt-4">
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96">
            {JSON.stringify(historicalData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
