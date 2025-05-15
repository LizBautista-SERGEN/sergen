import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CalendarIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ProfileCard } from "@/components/profile/ProfileCard";
import InvoicesTab from "@/components/profile/InvoicesTab";
import ContractsTab from "@/components/profile/ContractsTab";
import ReportsTab from "@/components/profile/ReportsTab";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const ProfilePage = () => {
  const { toast } = useToast();
  const { profile, isLoading, error, refetchProfile } = useUserProfile();
  const [isUpdating, setIsUpdating] = useState(false);
  const [contractExpirationDate, setContractExpirationDate] = useState<Date | undefined>(
    profile?.contract_expiration ? new Date(profile.contract_expiration) : undefined
  );

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
    
    // Use the selected date from the calendar if available
    if (contractExpirationDate) {
      formData.contract_expiration = contractExpirationDate.toISOString();
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
                <TabsTrigger value="reportes">Reportes</TabsTrigger>
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
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !contractExpirationDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {contractExpirationDate ? (
                            format(contractExpirationDate, "PPP", { locale: es })
                          ) : (
                            "Seleccionar fecha de vencimiento"
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={contractExpirationDate}
                          onSelect={setContractExpirationDate}
                          initialFocus
                          locale={es}
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
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
              
              <TabsContent value="reportes" className="mt-6">
                <ReportsTab />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
