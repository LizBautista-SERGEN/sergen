
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

const ProfilePage = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    getProfile();
    getDocuments();
  }, []);

  const getProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el perfil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDocuments = async () => {
    try {
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
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Cargando...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <div className="flex-1 ml-[300px]">
        <div className="container mx-auto px-4 py-24">
          <div className="flex gap-8">
            <ProfileCard profile={profile} onProfileUpdate={getProfile} />

            <div className="flex-1">
              <Tabs defaultValue="informacion" className="w-full">
                <TabsList className="w-full justify-start border-b mb-8">
                  <TabsTrigger value="informacion" className="text-lg data-[state=active]:border-b-2 data-[state=active]:border-sergen-500 rounded-none">
                    Información
                  </TabsTrigger>
                  <TabsTrigger value="contacto" className="text-lg data-[state=active]:border-b-2 data-[state=active]:border-sergen-500 rounded-none">
                    Contacto
                  </TabsTrigger>
                  <TabsTrigger value="archivos" className="text-lg data-[state=active]:border-b-2 data-[state=active]:border-sergen-500 rounded-none">
                    Archivos
                  </TabsTrigger>
                  <TabsTrigger value="configuracion" className="text-lg data-[state=active]:border-b-2 data-[state=active]:border-sergen-500 rounded-none">
                    Configuración
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="informacion">
                  <ProfileInfo profile={profile} />
                </TabsContent>

                <TabsContent value="contacto">
                  <ContactInfo profile={profile} onProfileUpdate={getProfile} readOnly={true} />
                </TabsContent>

                <TabsContent value="archivos">
                  <DocumentsManager 
                    documents={documents}
                    profile={profile}
                    onDocumentsUpdate={getDocuments}
                  />
                </TabsContent>

                <TabsContent value="configuracion" className="space-y-6">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h3 className="font-semibold mb-4">ACTUALIZAR DATOS DE CONTACTO</h3>
                      <ContactInfo profile={profile} onProfileUpdate={getProfile} />
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
