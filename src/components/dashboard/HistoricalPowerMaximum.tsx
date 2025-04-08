
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, subDays, parseISO } from "date-fns";
import { toast } from "sonner";

interface ChartData {
  date: string;
  value: number;
  fullDate: string;
  color: string;
}

interface PowerData {
  fecha: string;
  ejecutado: number;
}

export const HistoricalPowerMaximum = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaxPowerData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Get current date
        const today = new Date();
        // Get date from 30 days ago for a reasonable date range
        const thirtyDaysAgo = subDays(today, 30);
        
        console.log("Fetching historical power data...");
        console.log("Date range:", {
          start: thirtyDaysAgo.toISOString(),
          end: today.toISOString()
        });
        
        // Call our edge function to get the historical power data
        const response = await fetch(
          "https://zbixjkgwperxqrdhvtoy.supabase.co/functions/v1/get-historical-power-data",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              start_date: thirtyDaysAgo.toISOString(),
              end_date: today.toISOString(),
            }),
          }
        );
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Edge function error:', errorText);
          throw new Error(`Error from edge function: ${response.status} ${errorText}`);
        }

        const data: PowerData[] = await response.json();

        if (!data || data.length === 0) {
          console.log("No data found in the specified date range");
          setIsLoading(false);
          return;
        }

        console.log(`Retrieved ${data.length} records from edge function`);
        processData(data);
        
      } catch (err: any) {
        console.error('Error processing power data:', err);
        setError(`Error: ${err.message}`);
        toast.error("Error al cargar datos históricos de potencia");
      } finally {
        setIsLoading(false);
      }
    };
    
    const processData = (data: PowerData[]) => {
      try {
        // Process to find daily maximums between 18:00 and 23:00
        const dailyMaximums: Record<string, { fecha: string, max_power: number }> = {};
        
        data.forEach(item => {
          if (!item.fecha || typeof item.ejecutado !== 'number') {
            return;
          }

          try {
            // Parse the date string to a Date object
            const date = typeof item.fecha === 'string' ? parseISO(item.fecha) : new Date(item.fecha);
            
            // Get hour in UTC since the dates in Supabase are stored in UTC
            const hour = date.getUTCHours();
            
            // Filter for hours between 18:00 and 23:00
            if (hour >= 18 && hour <= 23) {
              const dateString = format(date, 'yyyy-MM-dd');
              
              if (!dailyMaximums[dateString] || item.ejecutado > dailyMaximums[dateString].max_power) {
                dailyMaximums[dateString] = {
                  fecha: item.fecha,
                  max_power: item.ejecutado
                };
              }
            }
          } catch (error) {
            console.error('Error processing date:', error, item);
          }
        });
        
        console.log('Daily maximums processed:', dailyMaximums);
        
        // Convert to chart data format
        const formattedData = Object.values(dailyMaximums)
          .map(item => {
            const date = typeof item.fecha === 'string' ? parseISO(item.fecha) : new Date(item.fecha);
            return {
              date: format(date, 'dd/MM'),
              fullDate: item.fecha,
              value: item.max_power,
              color: '#156082' // Default color, will be updated below
            };
          })
          .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
        
        // Find maximum value and assign color
        if (formattedData.length > 0) {
          // Sort by value to find highest values
          const sortedByValue = [...formattedData].sort((a, b) => b.value - a.value);
          
          // Assign colors
          formattedData.forEach(item => {
            if (sortedByValue.length > 0 && item.value === sortedByValue[0].value) {
              item.color = '#D9001B'; // Red for highest
            } else if (sortedByValue.length > 1 && item.value === sortedByValue[1].value) {
              item.color = '#F97316'; // Amber for second highest
            } else {
              item.color = '#156082'; // Default blue for the rest
            }
          });
        }
        
        setChartData(formattedData);
        console.log('Power maximum data:', formattedData);
      } catch (err: any) {
        console.error('Error in processData:', err);
        setError(`Error processing data: ${err.message}`);
      }
    };

    fetchMaxPowerData();
    
    // Refresh every 15 minutes
    const interval = setInterval(fetchMaxPowerData, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTooltip = (value: number) => {
    return [`${value.toFixed(2)} MW`, 'Potencia Máxima'];
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Potencia Máxima (18:00 - 23:00)</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Cargando datos...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-red-500">{error}</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">No hay datos disponibles en el rango horario de 18:00 a 23:00</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 20, left: 20 }}>
              <XAxis 
                dataKey="date" 
                angle={-45}
                textAnchor="end"
                height={50}
              />
              <YAxis />
              <Tooltip 
                formatter={formatTooltip}
                labelFormatter={(label) => `Fecha: ${label}`}
              />
              <Bar dataKey="value" name="Potencia Máxima">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
