
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { ProfileInfo } from "@/components/profile/ProfileInfo";
import { ContactInfo } from "@/components/profile/ContactInfo";
import { DocumentsManager } from "@/components/profile/DocumentsManager";
import { SecuritySettings } from "@/components/profile/SecuritySettings";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const ProfilePage = () => {
  const { toast } = useToast();
  const { profile, isLoading, error, refetchProfile } = useUserProfile();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);

  useEffect(() => {
    if (profile) {
      getDocuments();
    }
  }, [profile]);

  const getDocuments = async () => {
    try {
      setLoadingDocuments(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      let query = supabase
        .from('documents')
        .select('*')
        .eq('user_id', session.user.id);

      if (profile?.role !== 'superuser') {
        query = query.eq('deleted', false);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los documentos",
        variant: "destructive",
      });
    } finally {
      setLoadingDocuments(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        <div className="flex-1 ml-[300px] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Cargando información del perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        <div className="flex-1 ml-[300px] p-8">
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              Error al cargar el perfil: {error}. Por favor, intenta recargar la página.
            </AlertDescription>
          </Alert>
          <Button onClick={refetchProfile}>Reintentar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <div className="flex-1 ml-[300px]">
        <div className="container mx-auto px-4 py-24">
          <div className="flex flex-col md:flex-row gap-8">
            <ProfileCard profile={profile} onProfileUpdate={refetchProfile} />

            <div className="flex-1">
              <Tabs defaultValue="informacion" className="w-full">
                <TabsList className="w-full justify-start border-b mb-8">
                  <TabsTrigger value="informacion" className="text-lg data-[state=active]:border-b-2 data-[state=active]:border-sergen-500 rounded-none">
                    Datos de usuario
                  </TabsTrigger>
                  <TabsTrigger value="contacto" className="text-lg data-[state=active]:border-b-2 data-[state=active]:border-sergen-500 rounded-none">
                    Datos de contacto
                  </TabsTrigger>
                  <TabsTrigger value="archivos" className="text-lg data-[state=active]:border-b-2 data-[state=active]:border-sergen-500 rounded-none">
                    Subir archivos
                  </TabsTrigger>
                  <TabsTrigger value="configuracion" className="text-lg data-[state=active]:border-b-2 data-[state=active]:border-sergen-500 rounded-none">
                    Configuración
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="informacion">
                  <ProfileInfo profile={profile} />
                </TabsContent>

                <TabsContent value="contacto">
                  <ContactInfo profile={profile} onProfileUpdate={refetchProfile} readOnly={true} />
                </TabsContent>

                <TabsContent value="archivos">
                  {loadingDocuments ? (
                    <div className="text-center py-10">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                      <p>Cargando documentos...</p>
                    </div>
                  ) : (
                    <DocumentsManager 
                      documents={documents}
                      profile={profile}
                      onDocumentsUpdate={getDocuments}
                    />
                  )}
                </TabsContent>

                <TabsContent value="configuracion" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h3 className="font-semibold mb-4">ACTUALIZAR DATOS DE CONTACTO</h3>
                      <ContactInfo profile={profile} onProfileUpdate={refetchProfile} />
                    </div>

                    <div className="space-y-6">
                      <h3 className="font-semibold mb-4">CAMBIAR CONTRASEÑA</h3>
                      <SecuritySettings />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
