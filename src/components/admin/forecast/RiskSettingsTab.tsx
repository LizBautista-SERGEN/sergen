
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ForecastSettings } from "@/types/forecast";

export const RiskSettingsTab = () => {
  const [riskLevel, setRiskLevel] = useState("MEDIO");
  const [startHour, setStartHour] = useState("18:00");
  const [endHour, setEndHour] = useState("23:00");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('forecast_settings')
        .select('*')
        .single();
      
      if (error) {
        console.error('Error fetching settings:', error);
        return;
      }

      if (data) {
        setRiskLevel(data.risk_level || "MEDIO");
        
        // Parse time range if it exists
        if (data.time_range) {
          const [start, end] = data.time_range.split('-');
          if (start && end) {
            setStartHour(start.trim());
            setEndHour(end.trim());
          }
        } else {
          // Default values if time_range doesn't exist
          setStartHour("18:00");
          setEndHour("23:00");
        }
      }
    } catch (error) {
      console.error('Error in fetchSettings:', error);
    }
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      const timeRange = `${startHour} - ${endHour}`;
      
      const { error } = await supabase
        .from('forecast_settings')
        .upsert(
          { 
            id: '00000000-0000-0000-0000-000000000001',
            risk_level: riskLevel,
            time_range: timeRange,
            last_update: new Date().toISOString()
          },
          { onConflict: 'id' }
        );
      
      if (error) {
        console.error('Error saving settings:', error);
        toast.error("Error al guardar configuración");
        return;
      }
      
      toast.success("Configuración actualizada");
    } catch (error) {
      console.error('Error in saveSettings:', error);
      toast.error("Error al guardar configuración");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de Riesgo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="risk-level">Nivel de Riesgo</Label>
          <Select 
            value={riskLevel} 
            onValueChange={setRiskLevel}
          >
            <SelectTrigger id="risk-level" className="w-full">
              <SelectValue placeholder="Seleccionar nivel de riesgo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BAJO">BAJO</SelectItem>
              <SelectItem value="MEDIO">MEDIO</SelectItem>
              <SelectItem value="ALTO">ALTO</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-hour">Hora de inicio</Label>
            <Input 
              id="start-hour" 
              type="time" 
              value={startHour} 
              onChange={(e) => setStartHour(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-hour">Hora de fin</Label>
            <Input 
              id="end-hour" 
              type="time" 
              value={endHour} 
              onChange={(e) => setEndHour(e.target.value)}
            />
          </div>
        </div>

        <Button 
          onClick={saveSettings} 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? "Guardando..." : "Guardar Configuración"}
        </Button>
      </CardContent>
    </Card>
  );
};
