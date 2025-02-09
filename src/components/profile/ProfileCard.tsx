
import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Upload, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ProfileCardProps {
  profile: any;
  onProfileUpdate: () => void;
}

export const ProfileCard = ({ profile, onProfileUpdate }: ProfileCardProps) => {
  const { toast } = useToast();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'profile');
      formData.append('userId', session.user.id);

      const { error } = await supabase.functions.invoke('upload-file', {
        body: formData,
      });

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Archivo subido correctamente",
      });

      onProfileUpdate();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "No se pudo subir el archivo",
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

      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', session.user.id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Foto de perfil eliminada",
      });

      onProfileUpdate();
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

  return (
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
            onChange={handleFileUpload}
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
  );
};
