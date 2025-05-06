
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { RiskManagement } from "@/components/dashboard/risk-management/RiskManagement";
import { PowerCharts } from "@/components/dashboard/forecast/PowerCharts";
import { HistoricalPowerMaximum } from "@/components/dashboard/HistoricalPowerMaximum";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const ServiceControl = () => {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date());
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { session, loading: authLoading, isAuthenticated } = useAuth();

  // Efecto para redirigir cuando no hay sesión (autenticación)
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log("No hay sesión activa, redirigiendo a login");
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Efecto para actualizar la información de pronóstico sin cargar datos de energy_data
  useEffect(() => {
    // Si todavía está cargando la autenticación, no hacemos nada
    if (authLoading || !isAuthenticated) {
      return;
    }
    
    const updateForecastData = async () => {
      try {
        setLoading(true);
        console.log("Actualizando datos de pronóstico COES");
        
        // Actualizar datos de pronóstico COES sin cargar energy_data
        try {
          await supabase.functions.invoke('get-coes-forecast');
          setLastUpdated(new Date());
        } catch (e) {
          console.error('Error updating forecast data:', e);
        }
      } catch (error) {
        console.error('Error general:', error);
      } finally {
        setLoading(false);
      }
    };

    updateForecastData();
    
    // Actualizar cada 15 minutos
    const interval = setInterval(updateForecastData, 15 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [authLoading, isAuthenticated]);

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
          <div className="container mx-auto px-2 pt-12 pb-8">
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Control de Demanda</h1>
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
              <div className="grid grid-cols-12 gap-6 mt-4">
                <div className="col-span-4 space-y-4">
                  <RiskManagement 
                    energyData={[]} 
                    date={date} 
                    setDate={setDate}
                  />
                </div>

                <div className="col-span-8 space-y-4">
                  <PowerCharts 
                    energyData={[]}
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
