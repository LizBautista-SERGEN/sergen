
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "@/components/admin/UserManagement";
import { CourseManagement } from "@/components/admin/CourseManagement";
import { DailyPowerManagement } from "@/components/admin/DailyPowerManagement";
import { ForecastManagement } from "@/components/admin/ForecastManagement";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('No session found, redirecting to login');
        navigate('/login');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
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
        return;
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          navigate('/login');
        }
      });

      setLoading(false);

      return () => {
        subscription.unsubscribe();
      };
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
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">Gestión de Usuarios</TabsTrigger>
            <TabsTrigger value="courses">Gestión de Cursos</TabsTrigger>
            <TabsTrigger value="daily-power">Potencia Diaria</TabsTrigger>
            <TabsTrigger value="forecast">Pronóstico</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="courses">
            <CourseManagement />
          </TabsContent>

          <TabsContent value="daily-power">
            <DailyPowerManagement />
          </TabsContent>

          <TabsContent value="forecast">
            <ForecastManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
