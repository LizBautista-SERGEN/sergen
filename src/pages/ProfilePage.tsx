import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Upload, Trash2, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUserProfile } from "@/hooks/useUserProfile";

const ProfilePage = () => {
  const { toast } = useToast();
  const { profile, isLoading, error, refetchProfile } = useUserProfile();
  const [isUpdating, setIsUpdating] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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
    
    // Handle contract_expiration separately to avoid date format issues
    const contractExpValue = form.contract_expiration.value;
    if (contractExpValue && contractExpValue.trim() !== '') {
      formData.contract_expiration = contractExpValue;
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Por favor sube una imagen",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      setUploadingAvatar(true);

      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `profile_images/${session.user.id}/${fileName}`;

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase
        .storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('profiles')
        .getPublicUrl(filePath);

      // Update the user's profile with the new image URL
      const { error: updateError } = await supabase
        .from('user_accounts')
        .update({ profile_image: publicUrl })
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      toast({
        title: "Éxito",
        description: "Imagen de perfil actualizada correctamente",
      });

      refetchProfile();
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "No se pudo subir la imagen",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      setUploadingAvatar(true);

      // Update the user's profile to remove the image URL
      const { error } = await supabase
        .from('user_accounts')
        .update({ profile_image: null })
        .eq('id', session.user.id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Imagen de perfil eliminada correctamente",
      });

      refetchProfile();
    } catch (error: any) {
      console.error('Error deleting avatar:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la imagen de perfil",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 py-8">
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
      <div className="flex min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 py-8">
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
    <div className="flex min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Perfil</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Card */}
          <div className="flex flex-col items-center">
            <Card className="w-72 h-72 overflow-hidden bg-gradient-to-b from-sergen-100 to-sergen-50">
              <div className="relative w-full h-full">
                <Avatar className="w-full h-full rounded-lg">
                  <AvatarImage src={profile?.profile_image || ""} className="object-cover w-full h-full" />
                  <AvatarFallback className="text-4xl w-full h-full">{profile?.business_name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <label 
                    htmlFor="avatar-upload" 
                    className="bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50"
                  >
                    {uploadingAvatar ? (
                      <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 text-gray-600" />
                    )}
                  </label>
                  {profile?.profile_image && (
                    <button
                      onClick={handleDeleteAvatar}
                      className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-50"
                      disabled={uploadingAvatar}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  )}
                </div>
              </div>
            </Card>
            <h2 className="text-xl font-semibold mt-4 text-center">{profile?.business_name || "Empresa"}</h2>
          </div>

          {/* Tabs */}
          <div className="flex-1">
            <Tabs defaultValue="datos-usuario" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="datos-usuario">Datos de usuario</TabsTrigger>
                <TabsTrigger value="datos-contacto">Datos de contacto</TabsTrigger>
                <TabsTrigger value="archivos">Subir archivos</TabsTrigger>
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

              <TabsContent value="archivos" className="mt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-4">CONTRATOS Y ADENDAS:</h3>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">Arrastra o dale clic para subir un contrato (PDF)</p>
                      <input type="file" accept=".pdf" className="hidden" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-4">FACTURA DE SUMINISTRO ELÉCTRICO:</h3>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">Arrastra o dale clic para subir una factura (PDF o Excel)</p>
                      <input type="file" accept=".pdf,.xls,.xlsx" className="hidden" />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
