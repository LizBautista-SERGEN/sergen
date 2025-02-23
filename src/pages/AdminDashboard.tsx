
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { UserManagement } from "@/components/admin/UserManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ForecastPage } from "@/components/admin/forecast/ForecastPage";
import { useAuth } from "@/hooks/useAuth";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { userRole, loading, session } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!session) {
        console.log('No session, redirecting to login');
        navigate('/login');
        return;
      }

      if (userRole !== 'superuser') {
        console.log('Not a superuser, redirecting to dashboard');
        toast.error('No tienes permisos para acceder a esta página');
        navigate('/dashboard');
      }
    }
  }, [loading, session, userRole, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!session || userRole !== 'superuser') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Panel de Administración</h1>
          <Tabs defaultValue="users" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="users">Usuarios</TabsTrigger>
              <TabsTrigger value="forecast">Pronóstico</TabsTrigger>
            </TabsList>
            
            <TabsContent value="users" className="space-y-4">
              <div className="bg-white rounded-lg">
                <UserManagement />
              </div>
            </TabsContent>
            
            <TabsContent value="forecast" className="space-y-4">
              <div className="bg-white rounded-lg">
                <ForecastPage />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
