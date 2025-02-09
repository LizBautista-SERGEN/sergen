
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ContactInfoProps {
  profile: any;
  onProfileUpdate: () => void;
  readOnly?: boolean;
}

export const ContactInfo = ({ profile, onProfileUpdate, readOnly = false }: ContactInfoProps) => {
  const { toast } = useToast();

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
    }
  };

  return (
    <form onSubmit={handleContactUpdate} className="grid gap-4">
      <div>
        <label className="font-semibold mb-2 block">NOMBRES Y APELLIDOS:</label>
        <Input 
          name="contact_name" 
          defaultValue={profile?.contact_name || "Jefferson Rumichi"} 
          readOnly={readOnly}
          className={readOnly ? "bg-gray-50" : ""}
        />
      </div>
      <div>
        <label className="font-semibold mb-2 block">CARGO:</label>
        <Input 
          name="position" 
          defaultValue={profile?.position || "Jefe técnico de planta"} 
          readOnly={readOnly}
          className={readOnly ? "bg-gray-50" : ""}
        />
      </div>
      <div>
        <label className="font-semibold mb-2 block">PERFIL:</label>
        <Input 
          name="profile" 
          defaultValue={profile?.profile || "Técnico electricista"} 
          readOnly={readOnly}
          className={readOnly ? "bg-gray-50" : ""}
        />
      </div>
      <div>
        <label className="font-semibold mb-2 block">CORREO CORPORATIVO:</label>
        <Input 
          name="corporate_email" 
          defaultValue={profile?.corporate_email || "jrumichi@ultrafrio.com"} 
          readOnly={readOnly}
          className={readOnly ? "bg-gray-50" : ""}
        />
      </div>
      <div>
        <label className="font-semibold mb-2 block">CELULAR:</label>
        <Input 
          name="phone" 
          defaultValue={profile?.phone || "998765421"} 
          readOnly={readOnly}
          className={readOnly ? "bg-gray-50" : ""}
        />
      </div>
      {!readOnly && <Button type="submit">Actualizar</Button>}
    </form>
  );
};
