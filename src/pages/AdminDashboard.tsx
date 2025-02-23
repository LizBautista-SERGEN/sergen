
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { UserManagement } from "@/components/admin/UserManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ForecastPage } from "@/components/admin/forecast/ForecastPage";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking auth...'); // Debug log
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log('No session found'); // Debug log
          toast.error('Sesión no encontrada');
          navigate('/login');
          return;
        }

        console.log('Session found, checking profile...'); // Debug log
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Profile error:', profileError); // Debug log
          toast.error('Error al verificar permisos');
          navigate('/login');
          return;
        }

        if (profile?.role !== 'superuser') {
          console.log('Not a superuser:', profile?.role); // Debug log
          toast.error('No tienes permisos para acceder a esta página');
          navigate('/dashboard');
          return;
        }

        console.log('Auth check complete, loading dashboard...'); // Debug log
        setLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        toast.error('Error de autenticación');
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

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
        <h1 className="text-2xl font-bold mb-6">Panel de Administración</h1>
        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="forecast">Pronóstico</TabsTrigger>
          </TabsList>
          <TabsContent value="users" className="mt-6">
            <UserManagement />
          </TabsContent>
          <TabsContent value="forecast" className="mt-6">
            <ForecastPage />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
