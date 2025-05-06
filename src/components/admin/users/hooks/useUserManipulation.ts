
import { supabase } from "@/integrations/supabase/client";

export const useUserManipulation = () => {
  // Función para añadir un usuario manualmente a user_accounts sin usar RPC
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
          business_name: businessName || null
        });
        
      if (error) {
        console.error('Error adding user manually:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  };

  // Función para eliminar un usuario
  const deleteUser = async (userId: string) => {
    try {
      // Delete from user_accounts table
      const { error } = await supabase
        .from('user_accounts')
        .delete()
        .eq('id', userId);
        
      if (error) {
        console.error('Error deleting user:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  };

  return {
    addUserManually,
    deleteUser
  };
};
