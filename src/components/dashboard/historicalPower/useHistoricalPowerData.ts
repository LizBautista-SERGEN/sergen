
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ChartData, PowerData } from "./types";
import { fetchPowerData } from "./services/fetchPowerData";
import { processMaximumData } from "./utils/processMaximumData";

export const useHistoricalPowerData = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaxPowerData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch the power data
        const powerData = await fetchPowerData();
        
        console.log("Power data fetched:", powerData?.length || 0, "records");
        
        if (!powerData || powerData.length === 0) {
          setError("No se encontraron datos de potencia para el período seleccionado");
          return;
        }
        
        // Display sample data for debugging
        if (powerData.length > 0) {
          console.log("Sample power data:", powerData.slice(0, 3));
        }
        
        // Process the data to get daily maximums
        const processedData = processMaximumData(powerData);
        
        console.log("Processed data for chart:", processedData?.length || 0, "records");
        
        if (processedData.length === 0) {
          setError("No se pudieron procesar los datos de potencia máxima");
          return;
        }
        
        setChartData(processedData);
      } catch (err: any) {
        console.error('Error processing power data:', err);
        setError(`Error: ${err.message}`);
        toast.error("Error al cargar datos históricos de potencia");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaxPowerData();
    
    // Refresh every 15 minutes
    const interval = setInterval(fetchMaxPowerData, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { chartData, isLoading, error };
};
