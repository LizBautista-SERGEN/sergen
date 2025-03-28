
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProfileType } from "@/hooks/useUserProfile";
import { useState } from "react";

interface ContactInfoProps {
  profile: ProfileType | null;
  onProfileUpdate: () => void;
  readOnly?: boolean;
}

export const ContactInfo = ({ profile, onProfileUpdate, readOnly = false }: ContactInfoProps) => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleContactUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    const form = e.target as HTMLFormElement;
    const formData = {
      contact_name: form.contact_name.value,
      position: form.position.value,
      profile: form.profile.value,
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
        .from('profiles')
        .update(formData)
        .eq('id', session.user.id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Perfil actualizado correctamente",
      });

      onProfileUpdate();
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

  return (
    <form onSubmit={handleContactUpdate} className="grid gap-4">
      <div>
        <label className="font-semibold mb-2 block">NOMBRES Y APELLIDOS:</label>
        <Input 
          name="contact_name" 
          defaultValue={profile?.contact_name || ""} 
          readOnly={readOnly}
          className={readOnly ? "bg-gray-50" : ""}
        />
      </div>
      <div>
        <label className="font-semibold mb-2 block">CARGO:</label>
        <Input 
          name="position" 
          defaultValue={profile?.position || ""} 
          readOnly={readOnly}
          className={readOnly ? "bg-gray-50" : ""}
        />
      </div>
      <div>
        <label className="font-semibold mb-2 block">PERFIL:</label>
        <Input 
          name="profile" 
          defaultValue={profile?.profile || ""} 
          readOnly={readOnly}
          className={readOnly ? "bg-gray-50" : ""}
        />
      </div>
      <div>
        <label className="font-semibold mb-2 block">CORREO CORPORATIVO:</label>
        <Input 
          name="corporate_email" 
          defaultValue={profile?.corporate_email || ""} 
          readOnly={readOnly}
          className={readOnly ? "bg-gray-50" : ""}
        />
      </div>
      <div>
        <label className="font-semibold mb-2 block">CELULAR:</label>
        <Input 
          name="phone" 
          defaultValue={profile?.phone || ""} 
          readOnly={readOnly}
          className={readOnly ? "bg-gray-50" : ""}
        />
      </div>
      {!readOnly && (
        <Button type="submit" disabled={isUpdating}>
          {isUpdating ? "Actualizando..." : "Actualizar"}
        </Button>
      )}
    </form>
  );
};
