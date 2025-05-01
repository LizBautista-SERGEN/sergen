
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const PublicoTab = () => {
  const [riskLevel, setRiskLevel] = useState<string>("MEDIO");
  const [modulationTime, setModulationTime] = useState<string>("18:00 - 23:00");
  const [isLoading, setIsLoading] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('forecast_settings')
          .select('*')
          .order('last_update', { ascending: false })
          .limit(1)
          .single();
        
        if (error) {
          console.error('Error fetching settings:', error);
          toast.error('Error al cargar la configuración');
          return;
        }

        if (data) {
          setRiskLevel(data.risk_level || "MEDIO");
          setModulationTime(data.modulation_time || "18:00 - 23:00");
          setSettingsId(data.id);
        }

      } catch (error) {
        console.error('Error in fetchSettings:', error);
        toast.error('Error al cargar la configuración');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      if (settingsId) {
        const { error } = await supabase
          .from('forecast_settings')
          .update({
            risk_level: riskLevel,
            modulation_time: modulationTime,
            last_update: new Date().toISOString()
          })
          .eq('id', settingsId);

        if (error) {
          throw error;
        }
      } else {
        const { error } = await supabase
          .from('forecast_settings')
          .insert({
            risk_level: riskLevel,
            modulation_time: modulationTime
          });

        if (error) {
          throw error;
        }
      }

      toast.success('Configuración actualizada correctamente');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Configuración Pública</h3>
        
        <div className="space-y-2">
          <Label htmlFor="risk-level">Nivel de Riesgo Coincidente</Label>
          <Select 
            value={riskLevel} 
            onValueChange={setRiskLevel}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full" id="risk-level">
              <SelectValue placeholder="Seleccionar nivel de riesgo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BAJO">BAJO</SelectItem>
              <SelectItem value="MEDIO">MEDIO</SelectItem>
              <SelectItem value="ALTO">ALTO</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-4 mt-2">
            <div className="h-8 w-16 bg-[#F2FCE2] rounded flex items-center justify-center text-xs">BAJO</div>
            <div className="h-8 w-16 bg-[#F97316] rounded flex items-center justify-center text-white text-xs">MEDIO</div>
            <div className="h-8 w-16 bg-[#ea384c] rounded flex items-center justify-center text-white text-xs">ALTO</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="modulation-time">Rango Horario de Modulación</Label>
          <Input
            id="modulation-time"
            value={modulationTime}
            onChange={(e) => setModulationTime(e.target.value)}
            placeholder="Ej: 18:00 - 23:00"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500">Formato: HH:MM - HH:MM</p>
        </div>
        
        <Button 
          onClick={handleSaveSettings} 
          disabled={isLoading}
          className="mt-4"
        >
          {isLoading ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </div>
    </Card>
  );
};
