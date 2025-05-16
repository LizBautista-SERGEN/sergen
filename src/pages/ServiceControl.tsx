
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
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(false);
  const [settingsLastUpdate, setSettingsLastUpdate] = useState<Date | null>(null);
  const navigate = useNavigate();
  const { session, loading: authLoading, isAuthenticated } = useAuth();

  // Verificar autenticación y redirigir si no hay sesión
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log("No hay sesión activa, redirigiendo a login");
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Efecto para verificar y crear buckets de almacenamiento necesarios
  useEffect(() => {
    const checkStorageBuckets = async () => {
      try {
        await supabase.functions.invoke('check-storage-buckets');
        console.log("Verificación de buckets de almacenamiento completada");
      } catch (err) {
        console.error("Error verificando buckets de almacenamiento:", err);
      }
    };
    
    if (isAuthenticated) {
      checkStorageBuckets();
    }
  }, [isAuthenticated]);

  // Obtener la última actualización de configuración
  useEffect(() => {
    const fetchLastSettingsUpdate = async () => {
      try {
        const { data, error } = await supabase
          .from('forecast_settings')
          .select('last_update')
          .order('last_update', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error("Error al obtener la última actualización de configuración:", error);
          return;
        }

        if (data && data.last_update) {
          setSettingsLastUpdate(new Date(data.last_update));
        }
      } catch (err) {
        console.error("Error al consultar la última actualización de configuración:", err);
      }
    };

    if (isAuthenticated) {
      fetchLastSettingsUpdate();
    }
  }, [isAuthenticated]);

  // Efecto para actualizar la información de pronóstico
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
          toast.success("Datos de pronóstico actualizados");
        } catch (e) {
          console.error('Error updating forecast data:', e);
          toast.error("Error al actualizar datos de pronóstico");
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
          <div className="container mx-auto px-2 py-6">
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Control de Demanda</h1>
              <div className="text-sm text-gray-600">
                {settingsLastUpdate && (
                  <p>
                    Última actualización: {format(settingsLastUpdate, 'dd/MM/yyyy HH:mm')}
                  </p>
                )}
              </div>
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
                <div className="col-span-12 lg:col-span-4 space-y-4">
                  <RiskManagement 
                    energyData={[]} 
                    date={date} 
                    setDate={setDate}
                  />
                </div>

                <div className="col-span-12 lg:col-span-8 space-y-4">
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
