
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { RiskManagement } from "@/components/dashboard/RiskManagement";
import { PowerCharts } from "@/components/dashboard/PowerCharts";
import { HistoricalPowerMaximum } from "@/components/dashboard/HistoricalPowerMaximum";
import { EnergyData } from "@/types/energy";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

const ServiceControl = () => {
  const [energyData, setEnergyData] = useState<EnergyData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date());
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    // Set a default lastUpdated date
    setLastUpdated(new Date());
    
    // Set empty energy data to avoid profile-related queries
    setEnergyData([]);

    // Fetch last updated time from settings
    const fetchLastUpdated = async () => {
      const { data, error } = await supabase
        .from('forecast_settings')
        .select('last_update')
        .single();
        
      if (error) {
        console.error('Error fetching last update time:', error);
        return;
      }
      
      if (data?.last_update) {
        setLastUpdated(new Date(data.last_update));
      }
    };
    
    fetchLastUpdated();
    
    // Check for updates every 5 minutes
    const interval = setInterval(fetchLastUpdated, 5 * 60 * 1000);
    return () => clearInterval(interval);
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

              <div className="col-span-9 space-y-6">
                <PowerCharts 
                  energyData={energyData}
                  date={date}
                />
                
                <HistoricalPowerMaximum />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ServiceControl;
