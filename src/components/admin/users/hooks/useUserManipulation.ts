
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useUserManipulation = () => {
  // Función para añadir un usuario manualmente
  const addUserManually = async (userId: string, userEmail: string, role: string = 'user', businessName?: string) => {
    try {
      // Insert directly into user_accounts table 
      const { error } = await supabase
        .from('user_accounts')
        .insert({
          id: userId,
          email: userEmail.toLowerCase(),
          role: role,
          has_access: true,
          business_name: businessName || null,
          created_at: new Date().toISOString()
        });
        
      if (error) {
        console.error('Error adding user manually:', error);
        toast.error('Error al añadir usuario: ' + error.message);
        return false;
      }
      
      toast.success('Usuario añadido correctamente');
      return true;
    } catch (error: any) {
      console.error('Error:', error);
      toast.error('Error al añadir usuario: ' + error.message);
      return false;
    }
  };

  // Función para eliminar un usuario
  const deleteUser = async (userId: string) => {
    try {
      // Eliminar de user_accounts (esto eliminará en cascada de auth.users)
      const { error } = await supabase
        .from('user_accounts')
        .delete()
        .eq('id', userId);
        
      if (error) {
        console.error('Error deleting user:', error);
        toast.error('Error al eliminar usuario: ' + error.message);
        return false;
      }
      
      // Intentar eliminar también el usuario de auth
      try {
        await supabase.auth.admin.deleteUser(userId);
      } catch (authError) {
        console.error('Error deleting auth user (non-critical):', authError);
        // No bloqueamos el proceso si falla
      }
      
      toast.success('Usuario eliminado correctamente');
      return true;
    } catch (error: any) {
      console.error('Error:', error);
      toast.error('Error al eliminar usuario: ' + error.message);
      return false;
    }
  };

  return {
    addUserManually,
    deleteUser
  };
};
