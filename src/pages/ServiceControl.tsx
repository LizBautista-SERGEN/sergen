
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { RiskManagement } from "@/components/dashboard/risk-management/RiskManagement";
import { PowerCharts } from "@/components/dashboard/forecast/PowerCharts";
import { HistoricalPowerMaximum } from "@/components/dashboard/HistoricalPowerMaximum";
import { EnergyData } from "@/types/energy";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ServiceControl = () => {
  const [energyData, setEnergyData] = useState<EnergyData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date());
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(false);

  // Effect to check authentication and load initial data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/login');
          return;
        }
        
        // Fetch energy data for the authenticated user
        const { data, error } = await supabase
          .from('energy_data')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });
          
        if (error) {
          console.error('Error loading energy data:', error);
          toast.error('Error al cargar los datos de energía');
        } else {
          setEnergyData(data || []);
        }
        
        // Update coes_forecast data
        try {
          await supabase.functions.invoke('get-coes-forecast');
          setLastUpdated(new Date());
        } catch (e) {
          console.error('Error updating forecast data:', e);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        toast.error('Error de autenticación');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
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
