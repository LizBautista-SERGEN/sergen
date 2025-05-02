
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
import { useAuth } from "@/hooks/useAuth";

const ServiceControl = () => {
  const [energyData, setEnergyData] = useState<EnergyData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date());
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();

  // Redirigir si no hay sesión
  useEffect(() => {
    if (!authLoading && !session) {
      console.log("No hay sesión activa, redirigiendo a login");
      navigate('/login');
    }
  }, [session, authLoading, navigate]);

  // Cargar datos solo cuando tengamos sesión
  useEffect(() => {
    const loadData = async () => {
      if (authLoading || !session?.user || dataLoaded) {
        return;
      }
      
      try {
        setLoading(true);
        console.log("Cargando datos para el usuario:", session.user.id);
        
        // Consultar datos de energía para el usuario autenticado
        const { data, error } = await supabase
          .from('energy_data')
          .select('*')
          .eq('user_id', session.user.id)
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
  }, [session, authLoading, dataLoaded, navigate]);

  // Solo renderizar el contenido cuando no estemos cargando autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-gray-600">Cargando autenticación...</p>
      </div>
    );
  }

  // Si no hay sesión, no renderizar nada (el efecto redireccionará)
  if (!session) {
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
                <p className="text-lg text-gray-600">Cargando datos...</p>
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
