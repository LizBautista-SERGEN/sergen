
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { RiskManagement } from "@/components/dashboard/RiskManagement";
import { PowerCharts } from "@/components/dashboard/PowerCharts";
import { ServiceInfo } from "@/components/dashboard/ServiceInfo";
import { ServiceChatbot } from "@/components/dashboard/ServiceChatbot";
import { EnergyData } from "@/types/energy";

const ServiceControl = () => {
  const [userData, setUserData] = useState<any>(null);
  const [energyData, setEnergyData] = useState<EnergyData[]>([]);
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
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching energy data:', error);
        return;
      }

      console.log("Fetched energy data:", data);
      setEnergyData(data || []);
    };

    fetchUserData();
  }, [navigate]);

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex w-full">
        <DashboardSidebar />
        <div className="flex-1">
          <div className="container mx-auto px-2 pt-24 pb-8">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-3 space-y-6">
                <RiskManagement 
                  energyData={energyData} 
                  date={date} 
                  setDate={setDate}
                />
              </div>

              <div className="col-span-6">
                <PowerCharts 
                  energyData={energyData}
                  date={date}
                />
              </div>

              <div className="col-span-3">
                <ServiceInfo 
                  energyData={energyData}
                />
                <ServiceChatbot />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ServiceControl;
