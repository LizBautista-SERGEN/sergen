
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ProfileCard } from "@/components/profile/ProfileCard";
import InvoicesTab from "@/components/profile/InvoicesTab";
import ContractsTab from "@/components/profile/ContractsTab";

const ProfilePage = () => {
  const { toast } = useToast();
  const { profile, isLoading, error, refetchProfile } = useUserProfile();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    const form = e.target as HTMLFormElement;
    const formData: Record<string, any> = {
      business_name: form.business_name.value,
      ruc: form.ruc.value,
      activity: form.activity.value,
      electricity_provider: form.electricity_provider.value,
      contracted_power: form.contracted_power.value,
      notice_period: form.notice_period.value,
    };
    
    // Handle contract_expiration separately
    const contractExpValue = form.contract_expiration.value;
    if (contractExpValue && contractExpValue.trim() !== '') {
      formData.contract_expiration = contractExpValue;
    } else {
      formData.contract_expiration = null;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Error",
          description: "Debes iniciar sesión para actualizar el perfil",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('user_accounts')
        .update(formData)
        .eq('id', session.user.id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Perfil actualizado correctamente",
      });

      refetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleContactUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    const form = e.target as HTMLFormElement;
    const formData = {
      contact_name: form.contact_name.value,
      position: form.position.value,
      corporate_email: form.corporate_email.value,
      phone: form.phone.value,
    };

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Error",
          description: "Debes iniciar sesión para actualizar el perfil",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('user_accounts')
        .update(formData)
        .eq('id', session.user.id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Datos de contacto actualizados correctamente",
      });

      refetchProfile();
    } catch (error) {
      console.error('Error updating contact info:', error);
      toast({
        title: "Error",
        description: "No se pudieron actualizar los datos de contacto",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50 pt-8">
        <div className="container mx-auto px-4 py-4">
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
      <div className="flex min-h-screen bg-gray-50 pt-8">
        <div className="container mx-auto px-4 py-4">
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
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-2xl font-bold mb-6">Perfil</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Card */}
          <div className="md:w-1/4">
            <ProfileCard profile={profile} onProfileUpdate={refetchProfile} />
          </div>

          {/* Tabs */}
          <div className="flex-1">
            <Tabs defaultValue="datos-usuario" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="datos-usuario">Datos de usuario</TabsTrigger>
                <TabsTrigger value="datos-contacto">Datos de contacto</TabsTrigger>
                <TabsTrigger value="facturas">Facturas</TabsTrigger>
                <TabsTrigger value="contratos">Contratos y Adendas</TabsTrigger>
              </TabsList>

              <TabsContent value="datos-usuario" className="mt-6">
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label className="font-semibold mb-2 block">Razón social:</label>
                    <Input 
                      name="business_name" 
                      defaultValue={profile?.business_name || ""} 
                    />
                  </div>
                  <div>
                    <label className="font-semibold mb-2 block">RUC:</label>
                    <Input 
                      name="ruc" 
                      defaultValue={profile?.ruc || ""} 
                    />
                  </div>
                  <div>
                    <label className="font-semibold mb-2 block">Actividad:</label>
                    <Input 
                      name="activity" 
                      defaultValue={profile?.activity || ""} 
                    />
                  </div>
                  <div>
                    <label className="font-semibold mb-2 block">Suministrador eléctrico:</label>
                    <Input 
                      name="electricity_provider" 
                      defaultValue={profile?.electricity_provider || ""} 
                    />
                  </div>
                  <div>
                    <label className="font-semibold mb-2 block">Potencia contratada:</label>
                    <Input 
                      name="contracted_power" 
                      defaultValue={profile?.contracted_power || ""} 
                    />
                  </div>
                  <div>
                    <label className="font-semibold mb-2 block">Vencimiento de contrato:</label>
                    <Input 
                      name="contract_expiration" 
                      type="text"
                      placeholder="Abr 2026"
                      defaultValue={profile?.contract_expiration || ""} 
                    />
                  </div>
                  <div>
                    <label className="font-semibold mb-2 block">Periodo de aviso:</label>
                    <Input 
                      name="notice_period" 
                      defaultValue={profile?.notice_period || ""} 
                    />
                  </div>
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? "Actualizando..." : "Actualizar datos"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="datos-contacto" className="mt-6">
                <form onSubmit={handleContactUpdate} className="space-y-4">
                  <div>
                    <label className="font-semibold mb-2 block">Nombres y apellidos:</label>
                    <Input 
                      name="contact_name" 
                      defaultValue={profile?.contact_name || ""} 
                    />
                  </div>
                  <div>
                    <label className="font-semibold mb-2 block">Cargo:</label>
                    <Input 
                      name="position" 
                      defaultValue={profile?.position || ""} 
                    />
                  </div>
                  <div>
                    <label className="font-semibold mb-2 block">Correo corporativo:</label>
                    <Input 
                      name="corporate_email" 
                      defaultValue={profile?.corporate_email || ""} 
                    />
                  </div>
                  <div>
                    <label className="font-semibold mb-2 block">Celular:</label>
                    <Input 
                      name="phone" 
                      defaultValue={profile?.phone || ""} 
                    />
                  </div>
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? "Actualizando..." : "Actualizar contacto"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="facturas" className="mt-6">
                <InvoicesTab />
              </TabsContent>
              
              <TabsContent value="contratos" className="mt-6">
                <ContractsTab />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
