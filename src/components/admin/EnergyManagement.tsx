
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EnergyData } from "@/types/energy";
import { UploadEnergyData } from "./energy/UploadEnergyData";
import { EnergyForecastChart } from "./energy/EnergyForecastChart";
import { EnergyDataTable } from "./energy/EnergyDataTable";

export const EnergyManagement = () => {
  const [energyData, setEnergyData] = useState<EnergyData[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    fetchEnergyData();
  }, []);

  const fetchEnergyData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('No hay sesión activa');
        return;
      }

      console.log('Fetching energy data for user:', session.user.id);

      const { data, error } = await supabase
        .from('energy_data')
        .select('*')
        .eq('user_id', session.user.id)
        .order('date', { ascending: false })
        .order('time', { ascending: true });

      if (error) {
        console.error('Error fetching data:', error);
        toast.error('Error al cargar datos de energía');
        return;
      }

      console.log('Fetched energy data:', data);
      setEnergyData(data || []);
      if (data && data.length > 0) {
        setSelectedDate(data[0].date);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar datos');
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  return (
    <div className="space-y-6">
      <UploadEnergyData onUploadSuccess={fetchEnergyData} />
      <EnergyForecastChart 
        energyData={energyData}
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
      />
      <EnergyDataTable energyData={energyData} />
    </div>
  );
};
