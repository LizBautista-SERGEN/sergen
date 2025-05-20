
import { useState } from "react";
import { User } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { usePasswordReset } from "./usePasswordReset";

export const useUserActions = (refreshUsers: () => void) => {
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const { resetPassword } = usePasswordReset();

  const handleToggleAccess = async (userId: string, currentAccess: boolean) => {
    try {
      // Update in user_accounts
      const { error } = await supabase
        .from('user_accounts')
        .update({ has_access: !currentAccess })
        .eq('id', userId);

      if (error) {
        console.error('Error toggling access:', error);
        toast.error('Error al actualizar acceso: ' + error.message);
        return;
      }

      toast.success('Acceso actualizado exitosamente');
      refreshUsers();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error('Error al actualizar acceso: ' + error.message);
    }
  };

  const handleResetPassword = async (userId: string, userEmail: string) => {
    await resetPassword(userId, userEmail);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      // Delete from user_accounts
      const { error: deleteError } = await supabase
        .from('user_accounts')
        .delete()
        .eq('id', userToDelete.id);

      if (deleteError) {
        console.error('Error deleting user from user_accounts:', deleteError);
        toast.error('Error al eliminar usuario: ' + deleteError.message);
        return;
      }

      // También intentar eliminar de auth
      try {
        await supabase.auth.admin.deleteUser(userToDelete.id);
      } catch (authError) {
        console.error('Error deleting auth user (non-critical):', authError);
        // No bloqueamos el proceso si falla
      }

      toast.success('Usuario eliminado exitosamente');
      setUserToDelete(null);
      refreshUsers();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error('Error al eliminar usuario: ' + error.message);
    }
  };

  return {
    userToDelete,
    setUserToDelete,
    handleToggleAccess,
    handleResetPassword,
    handleDeleteUser
  };
};
