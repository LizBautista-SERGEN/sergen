
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ChartData } from "./types";
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
        
        // Process the data to get daily maximums
        const processedData = processMaximumData(powerData);
        
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
