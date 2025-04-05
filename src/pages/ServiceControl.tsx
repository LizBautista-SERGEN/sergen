
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { RiskManagement } from "@/components/dashboard/RiskManagement";
import { PowerCharts } from "@/components/dashboard/PowerCharts";
import { HistoricalPowerMaximum } from "@/components/dashboard/HistoricalPowerMaximum";
import { EnergyData } from "@/types/energy";
import { format } from "date-fns";

const ServiceControl = () => {
  const [userData, setUserData] = useState<any>(null);
  const [energyData, setEnergyData] = useState<EnergyData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('energy_data')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching energy data:', error);
        return;
      }

      // Convert the data to match EnergyData type
      const formattedData: EnergyData[] = data?.map(item => ({
        id: item.id,
        date: item.date,
        time: item.time,
        forecasted_power: item.forecasted_power,
        executed_power: item.executed_power,
        user_id: item.user_id,
        created_at: item.created_at
      })) || [];

      console.log("Fetched energy data:", formattedData);
      setEnergyData(formattedData);
      
      // Set the last updated time
      if (data && data.length > 0) {
        setLastUpdated(new Date(data[0].created_at));
      }
    };

    fetchUserData();
  }, [navigate]);

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex w-full">
        <DashboardSidebar />
        <div className="flex-1">
          <div className="container mx-auto px-2 pt-24 pb-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Control de Demanda</h1>
              {lastUpdated && (
                <p className="text-sm text-gray-600">
                  Última actualización: {format(lastUpdated, 'dd/MM/yyyy HH:mm')}
                </p>
              )}
            </div>
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-3 space-y-6">
                <RiskManagement 
                  energyData={energyData} 
                  date={date} 
                  setDate={setDate}
                />
              </div>

              <div className="col-span-9">
                <PowerCharts 
                  energyData={energyData}
                  date={date}
                />
                
                <div className="mt-6">
                  <HistoricalPowerMaximum />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ServiceControl;
