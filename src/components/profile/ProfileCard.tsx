
import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Upload, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ProfileType } from "@/hooks/useUserProfile";

interface ProfileCardProps {
  profile: ProfileType | null;
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
    } catch (error: any) {
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
        .update({ profile: null })
        .eq('id', session.user.id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Foto de perfil eliminada",
      });

      onProfileUpdate();
    } catch (error: any) {
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
    <div className="flex flex-col items-center">
      <Card className="w-72 h-72 overflow-hidden bg-gradient-to-b from-sergen-100 to-sergen-50">
        <div className="relative w-full h-full">
          <Avatar className="w-full h-full rounded-lg">
            <AvatarImage src={profile?.profile || ""} className="object-cover w-full h-full" />
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
            {profile?.profile && (
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
  );
};
