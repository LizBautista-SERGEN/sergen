
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const usePasswordReset = () => {
  // Función para resetear la contraseña directamente a "admin01"
  const resetPassword = async (userId: string, userEmail: string) => {
    try {
      // Verificar que el usuario actual está autenticado
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user.id) {
        toast.error('No tiene permisos para realizar esta acción');
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
      
      toast.success(`Contraseña actualizada a 'admin01' para ${userEmail}`);
      return true;
    } catch (error: any) {
      console.error('Error:', error);
      toast.error('Error al resetear la contraseña: ' + error.message);
      return false;
    }
  };

  return { resetPassword };
};
