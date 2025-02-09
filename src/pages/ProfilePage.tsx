
import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Upload, Trash2, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const ProfilePage = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [deletingDocument, setDeletingDocument] = useState<string | null>(null);

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

      // Only show non-deleted documents for regular users
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'contract' | 'invoice') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type !== 'profile') {
      // Validate file type for documents
      const allowedTypes = ['application/pdf'];
      if (type === 'invoice') {
        allowedTypes.push('application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      }
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Error",
          description: "Formato de archivo no permitido",
          variant: "destructive",
        });
        return;
      }
    } else {
      // Validate image type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Por favor sube una imagen",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      if (type === 'profile') setUploadingAvatar(true);
      else setUploadingDocument(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('userId', session.user.id);

      const { error } = await supabase.functions.invoke('upload-file', {
        body: formData,
      });

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Archivo subido correctamente",
      });

      if (type === 'profile') {
        getProfile();
      } else {
        getDocuments();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "No se pudo subir el archivo",
        variant: "destructive",
      });
    } finally {
      if (type === 'profile') setUploadingAvatar(false);
      else setUploadingDocument(false);
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      setUploadingAvatar(true);

      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', session.user.id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Foto de perfil eliminada",
      });

      getProfile();
    } catch (error) {
      console.error('Error deleting avatar:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la foto de perfil",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      setDeletingDocument(documentId);

      const { error } = await supabase
        .from('documents')
        .update({ deleted: true })
        .eq('id', documentId);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Documento eliminado correctamente",
      });

      // Refresh documents list
      getDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el documento",
        variant: "destructive",
      });
    } finally {
      setDeletingDocument(null);
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
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <div className="flex-1 ml-[300px]">
        <div className="container mx-auto px-4 py-24">
          <div className="flex gap-8">
            <Card className="w-72 h-fit bg-gradient-to-b from-sergen-100 to-sergen-50 p-6">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 relative">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback>{profile?.business_name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <input
                    type="file"
                    id="avatar-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'profile')}
                  />
                  <div className="absolute -bottom-2 right-0 flex gap-2">
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
                    {profile?.avatar_url && (
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
                <h2 className="text-xl font-semibold mt-4">{profile?.business_name || "Ultrafrio S.A.C."}</h2>
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
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {documents
                          .filter(doc => doc.document_type === 'contract' && (!doc.deleted || profile?.role === 'superuser'))
                          .map((doc) => (
                            <div key={doc.id} className="group relative">
                              <a 
                                href={`${supabase.storage.from('contracts').getPublicUrl(doc.file_path).data.publicUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                              >
                                <div className={`bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow ${doc.deleted ? 'opacity-50' : ''}`}>
                                  <div className="aspect-square flex items-center justify-center mb-4 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                                    <FileText className="w-12 h-12 text-blue-600" />
                                  </div>
                                  <div className="text-sm text-center font-medium text-gray-700 truncate group-hover:text-blue-600">
                                    {doc.filename}
                                    {doc.deleted && <span className="block text-xs text-red-500">(Eliminado)</span>}
                                  </div>
                                </div>
                              </a>
                              {!doc.deleted && (
                                <button
                                  onClick={() => handleDeleteDocument(doc.id)}
                                  className="absolute -top-2 -right-2 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
                                  disabled={deletingDocument === doc.id}
                                >
                                  {deletingDocument === doc.id ? (
                                    <Loader2 className="w-4 h-4 text-red-600 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  )}
                                </button>
                              )}
                            </div>
                          ))}
                      </div>
                      <div className="mt-6">
                        <input
                          type="file"
                          id="contract-upload"
                          className="hidden"
                          accept=".pdf"
                          onChange={(e) => handleFileUpload(e, 'contract')}
                        />
                        <label
                          htmlFor="contract-upload"
                          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center block cursor-pointer hover:border-gray-400"
                        >
                          {uploadingDocument ? (
                            <Loader2 className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-spin" />
                          ) : (
                            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          )}
                          <p className="text-gray-600">Arrastra o dale clic para subir un contrato (PDF)</p>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-4">FACTURA DE SUMINISTRO ELÉCTRICO:</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {documents
                          .filter(doc => doc.document_type === 'invoice' && (!doc.deleted || profile?.role === 'superuser'))
                          .map((doc) => (
                            <div key={doc.id} className="group relative">
                              <a 
                                href={`${supabase.storage.from('invoices').getPublicUrl(doc.file_path).data.publicUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                              >
                                <div className={`bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow ${doc.deleted ? 'opacity-50' : ''}`}>
                                  <div className="aspect-square flex items-center justify-center mb-4 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                                    <FileText className="w-12 h-12 text-green-600" />
                                  </div>
                                  <div className="text-sm text-center font-medium text-gray-700 truncate group-hover:text-green-600">
                                    {doc.filename}
                                    {doc.deleted && <span className="block text-xs text-red-500">(Eliminado)</span>}
                                  </div>
                                </div>
                              </a>
                              {!doc.deleted && (
                                <button
                                  onClick={() => handleDeleteDocument(doc.id)}
                                  className="absolute -top-2 -right-2 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
                                  disabled={deletingDocument === doc.id}
                                >
                                  {deletingDocument === doc.id ? (
                                    <Loader2 className="w-4 h-4 text-red-600 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  )}
                                </button>
                              )}
                            </div>
                          ))}
                      </div>
                      <div className="mt-6">
                        <input
                          type="file"
                          id="invoice-upload"
                          className="hidden"
                          accept=".pdf,.xls,.xlsx"
                          onChange={(e) => handleFileUpload(e, 'invoice')}
                        />
                        <label
                          htmlFor="invoice-upload"
                          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center block cursor-pointer hover:border-gray-400"
                        >
                          {uploadingDocument ? (
                            <Loader2 className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-spin" />
                          ) : (
                            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          )}
                          <p className="text-gray-600">Arrastra o dale clic para subir una factura (PDF o Excel)</p>
                        </label>
                      </div>
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
      </div>
    </div>
  );
};

export default ProfilePage;
