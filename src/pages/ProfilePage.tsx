
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ProfileCard } from "@/components/profile/ProfileCard";
import InvoicesTab from "@/components/profile/InvoicesTab";
import ContractsTab from "@/components/profile/ContractsTab";
import { ContactInfo } from "@/components/profile/ContactInfo";
import { ProfileLoading } from "@/components/profile/ProfileLoading";
import { ProfileError } from "@/components/profile/ProfileError";
import { UserDataForm } from "@/components/profile/UserDataForm";
import { SecurityTab } from "@/components/profile/SecurityTab";

const ProfilePage = () => {
  const { profile, isLoading, error, refetchProfile } = useUserProfile();
  const [activeTab, setActiveTab] = useState("datos-usuario");

  if (isLoading) {
    return <ProfileLoading />;
  }

  if (error) {
    return <ProfileError error={error} onRetry={refetchProfile} />;
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="datos-usuario">Datos de usuario</TabsTrigger>
                <TabsTrigger value="datos-contacto">Datos de contacto</TabsTrigger>
                <TabsTrigger value="facturas">Facturas</TabsTrigger>
                <TabsTrigger value="contratos">Contratos y Adendas</TabsTrigger>
                <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
              </TabsList>

              <TabsContent value="datos-usuario" className="mt-6">
                <UserDataForm profile={profile} onProfileUpdate={refetchProfile} />
              </TabsContent>

              <TabsContent value="datos-contacto" className="mt-6">
                <ContactInfo profile={profile} onProfileUpdate={refetchProfile} />
              </TabsContent>

              <TabsContent value="facturas" className="mt-6">
                <InvoicesTab />
              </TabsContent>
              
              <TabsContent value="contratos" className="mt-6">
                <ContractsTab />
              </TabsContent>

              <TabsContent value="seguridad" className="mt-6">
                <SecurityTab />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
