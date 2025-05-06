
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const usePasswordReset = () => {
  // Función para resetear la contraseña directamente a "admin01"
  const resetPassword = async (userId: string, userEmail: string) => {
    try {
      // Solo superusuarios pueden realizar esta acción
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user.id) {
        toast.error('No tiene permisos para realizar esta acción');
        return false;
      }

      const { data: currentUser } = await supabase
        .from('user_accounts')
        .select('role')
        .eq('id', session.user.id)
        .single();
        
      if (currentUser?.role !== 'superuser') {
        toast.error('Solo superusuarios pueden resetear contraseñas');
        return false;
      }

      // Utilizamos el servicio de administrador para actualizar la contraseña
      const { error } = await supabase.auth.admin.updateUserById(
        userId,
        { password: 'admin01' }
      );
        
      if (error) {
        console.error('Error resetting password:', error);
        toast.error('Error al resetear la contraseña');
        return false;
      }
      
      toast.success(`Contraseña reseteada a 'admin01' para ${userEmail}`);
      return true;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al resetear la contraseña');
      return false;
    }
  };

  return { resetPassword };
};
