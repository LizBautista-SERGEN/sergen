
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HistoricalTab } from "@/components/admin/forecast/HistoricalTab";
import { ModulationTab } from "@/components/admin/ModulationTab";
import { PublicoTab } from "@/components/admin/PublicoTab";
import { UserManagementTab } from "@/components/admin/UserManagementTab";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";
import { toast } from "sonner";

const ConfiguracionPage = () => {
  const navigate = useNavigate();
  const { isSuperUser, isLoading } = useUserProfile();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated and has superuser access
    const checkAccess = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast.error("Necesita iniciar sesión para acceder a esta página");
          navigate("/login");
          return;
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error checking access:", error);
        toast.error("Error al verificar permisos");
        navigate("/login");
      }
    };

    checkAccess();
  }, [navigate]);
  
  // Redirect non-superusers
  useEffect(() => {
    if (!isLoading && !isSuperUser) {
      toast.error("No tiene permisos para acceder a esta página");
      navigate("/servicios/control");
    }
  }, [isSuperUser, isLoading, navigate]);
  
  if (loading || isLoading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center h-screen">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-sergen-500 border-gray-200 rounded-full animate-spin mb-4"></div>
          <p className="text-lg text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Only render content for superusers
  if (!isSuperUser) return null;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Configuración</h1>
      <Card className="p-6">
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-fit grid-cols-4 gap-4">
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="historical">Histórico</TabsTrigger>
            <TabsTrigger value="modulation">Modulación</TabsTrigger>
            <TabsTrigger value="publico">Público</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <UserManagementTab />
          </TabsContent>

          <TabsContent value="historical">
            <HistoricalTab />
          </TabsContent>
          
          <TabsContent value="modulation">
            <ModulationTab />
          </TabsContent>
          
          <TabsContent value="publico">
            <PublicoTab />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default ConfiguracionPage;
