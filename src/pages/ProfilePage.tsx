
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ProfilePage = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile();
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

  const updateProfile = async (formData: any) => {
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
        .from('profiles')
        .update(formData)
        .eq('id', session.user.id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Perfil actualizado correctamente",
      });

      getProfile(); // Refresh profile data
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    }
  };

  const handleContactUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = {
      contact_name: form.contact_name.value,
      position: form.position.value,
      profile: form.profile.value,
      corporate_email: form.corporate_email.value,
      phone: form.phone.value,
    };
    await updateProfile(formData);
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Cargando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        <Card className="w-72 h-fit bg-gradient-to-b from-sergen-100 to-sergen-50 p-6">
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 bg-sergen-500 rounded-full mb-4 relative">
              <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg">
                <Upload className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <h2 className="text-xl font-semibold">{profile?.business_name || "Ultrafrio S.A.C."}</h2>
          </div>
        </Card>

        <div className="flex-1">
          <Tabs defaultValue="informacion" className="w-full">
            <TabsList className="w-full justify-start border-b mb-8">
              <TabsTrigger value="informacion" className="data-[state=active]:border-b-2 data-[state=active]:border-sergen-500 rounded-none">
                Información
              </TabsTrigger>
              <TabsTrigger value="contacto" className="data-[state=active]:border-b-2 data-[state=active]:border-sergen-500 rounded-none">
                Contacto
              </TabsTrigger>
              <TabsTrigger value="archivos" className="data-[state=active]:border-b-2 data-[state=active]:border-sergen-500 rounded-none">
                Archivos
              </TabsTrigger>
              <TabsTrigger value="configuracion" className="data-[state=active]:border-b-2 data-[state=active]:border-sergen-500 rounded-none">
                Configuración
              </TabsTrigger>
            </TabsList>

            <TabsContent value="informacion" className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <label className="font-semibold mb-2 block">RAZÓN SOCIAL:</label>
                  <div className="text-gray-700">{profile?.business_name || "Ultrafrio S.A.C."}</div>
                </div>
                <div>
                  <label className="font-semibold mb-2 block">RUC:</label>
                  <div className="text-gray-700">{profile?.ruc || "20608382616"}</div>
                </div>
                <div>
                  <label className="font-semibold mb-2 block">ACTIVIDAD:</label>
                  <div className="text-gray-700">{profile?.activity || "Proceso de productos hidrobiológicos"}</div>
                </div>
                <div>
                  <label className="font-semibold mb-2 block">SUMINISTRADOR ELÉCTRICO:</label>
                  <div className="text-gray-700">{profile?.electricity_provider || "Pluz Energía"}</div>
                </div>
                <div>
                  <label className="font-semibold mb-2 block">POTENCIA CONTRATADA:</label>
                  <div className="text-gray-700">{profile?.contracted_power || "500 kW"}</div>
                </div>
                <div>
                  <label className="font-semibold mb-2 block">VENCIMIENTO DE CONTRATO:</label>
                  <div className="text-gray-700">{profile?.contract_expiration ? new Date(profile.contract_expiration).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }) : "Abril 2026"}</div>
                </div>
                <div>
                  <label className="font-semibold mb-2 block">PERIODO DE AVISO:</label>
                  <div className="text-gray-700">{profile?.notice_period || "12 meses"}</div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contacto" className="space-y-6">
              <form onSubmit={handleContactUpdate} className="grid gap-4">
                <div>
                  <label className="font-semibold mb-2 block">NOMBRES Y APELLIDOS:</label>
                  <div className="text-gray-700">{profile?.contact_name || "Jefferson Rumichi"}</div>
                </div>
                <div>
                  <label className="font-semibold mb-2 block">CARGO:</label>
                  <div className="text-gray-700">{profile?.position || "Jefe técnico de planta"}</div>
                </div>
                <div>
                  <label className="font-semibold mb-2 block">PERFIL:</label>
                  <div className="text-gray-700">{profile?.profile || "Técnico electricista"}</div>
                </div>
                <div>
                  <label className="font-semibold mb-2 block">CORREO CORPORATIVO:</label>
                  <div className="text-gray-700">{profile?.corporate_email || "jrumichi@ultrafrio.com"}</div>
                </div>
                <div>
                  <label className="font-semibold mb-2 block">CELULAR:</label>
                  <div className="text-gray-700">{profile?.phone || "998765421"}</div>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="archivos" className="space-y-6">
              <div className="space-y-8">
                <div>
                  <h3 className="font-semibold mb-4">CONTRATOS Y ADENDAS:</h3>
                  <div className="flex gap-4">
                    <div className="text-center">
                      <img src="/pdf-icon.png" alt="PDF" className="w-12 h-12 mx-auto mb-2" />
                      <div className="text-sm">Contrato 2017</div>
                    </div>
                    <div className="text-center">
                      <img src="/pdf-icon.png" alt="PDF" className="w-12 h-12 mx-auto mb-2" />
                      <div className="text-sm">Adenda 2020</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">FACTURA DE SUMINISTRO ELÉCTRICO:</h3>
                  <div className="grid grid-cols-4 gap-4">
                    {['Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre'].map((month) => (
                      <div key={month} className="text-center">
                        <img src="/pdf-icon.png" alt="PDF" className="w-12 h-12 mx-auto mb-2" />
                        <div className="text-sm">{month} 2024</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Arrastra o dale clic para subir tu archivo.</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="configuracion" className="space-y-6">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="font-semibold mb-4">ACTUALIZAR DATOS DE CONTACTO</h3>
                  <form onSubmit={handleContactUpdate} className="space-y-4">
                    <div>
                      <label className="font-semibold mb-2 block">NOMBRES Y APELLIDOS:</label>
                      <Input name="contact_name" defaultValue={profile?.contact_name || "Jefferson Rumichi"} />
                    </div>
                    <div>
                      <label className="font-semibold mb-2 block">CARGO:</label>
                      <Input name="position" defaultValue={profile?.position || "Jefe técnico de planta"} />
                    </div>
                    <div>
                      <label className="font-semibold mb-2 block">PERFIL:</label>
                      <Input name="profile" defaultValue={profile?.profile || "Técnico electricista"} />
                    </div>
                    <div>
                      <label className="font-semibold mb-2 block">CORREO CORPORATIVO:</label>
                      <Input name="corporate_email" defaultValue={profile?.corporate_email || "jrumichi@ultrafrio.com"} />
                    </div>
                    <div>
                      <label className="font-semibold mb-2 block">CELULAR:</label>
                      <Input name="phone" defaultValue={profile?.phone || "998765421"} />
                    </div>
                    <Button type="submit" className="bg-blue-500 hover:bg-blue-600">Actualizar</Button>
                  </form>
                </div>

                <div className="space-y-6">
                  <h3 className="font-semibold mb-4">CAMBIAR CONTRASEÑA</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="font-semibold mb-2 block">ACTUAL CONTRASEÑA:</label>
                      <div className="relative">
                        <Input type="password" />
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <label className="font-semibold mb-2 block">NUEVA CONTRASEÑA:</label>
                      <div className="relative">
                        <Input type="password" />
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <label className="font-semibold mb-2 block">REPETIR CONTRASEÑA:</label>
                      <div className="relative">
                        <Input type="password" />
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    <Button className="bg-blue-500 hover:bg-blue-600">Cambiar contraseña</Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
