
import { useEffect, useState, useMemo } from "react";
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
import { useAuth } from "@/hooks/useAuth";

const ServiceControl = () => {
  const [energyData, setEnergyData] = useState<EnergyData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date());
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const navigate = useNavigate();
  const { session, loading: authLoading, isAuthenticated } = useAuth();

  // Memoizado para evitar re-renderizados innecesarios
  const userId = useMemo(() => session?.user?.id, [session]);

  // Efecto para redirigir cuando no hay sesión (autenticación)
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log("No hay sesión activa, redirigiendo a login");
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Efecto separado para cargar datos solo cuando tengamos sesión
  useEffect(() => {
    // Si todavía está cargando la autenticación o si ya cargamos los datos, no hacemos nada
    if (authLoading || !userId || dataLoaded) {
      return;
    }
    
    const loadData = async () => {
      try {
        setLoading(true);
        console.log("Cargando datos para el usuario:", userId);
        
        // Consultar datos de energía para el usuario autenticado
        const { data, error } = await supabase
          .from('energy_data')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false });
          
        if (error) {
          console.error('Error loading energy data:', error);
          toast.error('Error al cargar los datos de energía');
        } else {
          console.log("Datos obtenidos:", data?.length || 0, "registros");
          setEnergyData(data || []);
          setDataLoaded(true);
        }
        
        // Actualizar datos de pronóstico COES
        try {
          await supabase.functions.invoke('get-coes-forecast');
          setLastUpdated(new Date());
        } catch (e) {
          console.error('Error updating forecast data:', e);
        }
      } catch (error) {
        console.error('Error general al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId, authLoading, dataLoaded]);

  // Si está cargando la autenticación, mostrar loading spinner
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-sergen-500 border-gray-200 rounded-full animate-spin mb-4"></div>
          <p className="text-lg text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no hay sesión, no renderizamos nada (el efecto redireccionará)
  if (!isAuthenticated) {
    return null;
  }

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
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-t-sergen-500 border-gray-200 rounded-full animate-spin mb-4"></div>
                  <p className="text-lg text-gray-600">Cargando datos...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-4 space-y-6">
                  <RiskManagement 
                    energyData={energyData} 
                    date={date} 
                    setDate={setDate}
                  />
                </div>

                <div className="col-span-8 space-y-6">
                  <PowerCharts 
                    energyData={energyData}
                    date={date}
                  />
                  
                  <HistoricalPowerMaximum />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ServiceControl;
