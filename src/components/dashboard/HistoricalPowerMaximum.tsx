
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, subDays } from "date-fns";

interface ChartData {
  date: string;
  value: number;
  fullDate: string;
  color: string;
}

export const HistoricalPowerMaximum = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMaxPowerData = async () => {
      setIsLoading(true);
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
        
        // Query the coes_historical table directly
        const { data, error } = await supabase
          .from('coes_historical')
          .select('fecha, ejecutado')
          .gte('fecha', thirtyDaysAgo.toISOString())
          .lte('fecha', today.toISOString())
          .order('fecha', { ascending: true });

        if (error) {
          console.error('Error fetching historical power data:', error);
          return;
        }

        console.log(`Retrieved ${data?.length || 0} records from coes_historical`, data);

        // Process to find daily maximums between 18:00 and 23:00
        const dailyMaximums: Record<string, { fecha: string, max_power: number }> = {};
        
        data?.forEach(item => {
          if (!item.fecha || typeof item.ejecutado !== 'number') {
            return;
          }

          try {
            const date = new Date(item.fecha);
            const hour = date.getHours();
            
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
            const date = new Date(item.fecha);
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
      } catch (err) {
        console.error('Error processing power data:', err);
      } finally {
        setIsLoading(false);
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
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">No hay datos disponibles</p>
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
