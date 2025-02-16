
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { UserManagement } from "@/components/admin/UserManagement";
import { ForecastManagement } from "@/components/admin/ForecastManagement";
import { DemandHistoryView } from "@/components/admin/DemandHistoryView";
import { PeakPowerView } from "@/components/admin/PeakPowerView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, LineChart, History, Zap } from "lucide-react";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/login');
        return;
      }

      // When token is refreshed, verify the user's role
      if (event === 'TOKEN_REFRESHED') {
        verifyUserRole(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const verifyUserRole = async (userId: string) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        toast.error('Error al verificar permisos');
        navigate('/login');
        return;
      }

      if (profile?.role !== 'superuser') {
        console.log('User is not superuser, redirecting to dashboard');
        toast.error('No tienes permisos para acceder a esta página');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Profile verification error:', error);
      navigate('/login');
    }
  };

  const checkAuth = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw sessionError;
      }

      if (!session) {
        console.log('No session found, redirecting to login');
        navigate('/login');
        return;
      }

      await verifyUserRole(session.user.id);
      setLoading(false);

    } catch (error) {
      console.error('Auth check error:', error);
      toast.error('Error de autenticación');
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="forecast" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuarios
            </TabsTrigger>
            <TabsTrigger value="forecast" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              Pronóstico
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="power" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Potencia
            </TabsTrigger>
          </TabsList>
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          <TabsContent value="forecast">
            <ForecastManagement />
          </TabsContent>
          <TabsContent value="history">
            <DemandHistoryView />
          </TabsContent>
          <TabsContent value="power">
            <PeakPowerView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
