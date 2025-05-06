
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

      // Verificar que el usuario actual es superusuario
      const { data: currentUser } = await supabase
        .from('user_accounts')
        .select('role')
        .eq('id', session.user.id)
        .single();
        
      if (currentUser?.role !== 'superuser') {
        toast.error('Solo superusuarios pueden resetear contraseñas');
        return false;
      }

      // Usar la función edge para resetear la contraseña
      const { data, error } = await supabase.functions.invoke('reset-password', {
        body: { userId, email: userEmail }
      });
        
      if (error || (data && !data.success)) {
        console.error('Error resetting password:', error || data.error);
        toast.error('Error al resetear la contraseña: ' + (error?.message || data?.error || 'Error desconocido'));
        return false;
      }
      
      toast.success(`Contraseña reseteada a 'admin01' para ${userEmail}`);
      return true;
    } catch (error: any) {
      console.error('Error:', error);
      toast.error('Error al resetear la contraseña: ' + error.message);
      return false;
    }
  };

  return { resetPassword };
};
