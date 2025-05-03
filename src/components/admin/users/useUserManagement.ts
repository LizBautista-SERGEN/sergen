
import { useState, useEffect } from "react";
import { User } from "./UsersTable";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Check if current user is superuser
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user.id) {
        toast.error('No tiene permisos para ver usuarios');
        setLoading(false);
        return;
      }

      // Verificar primero si el usuario actual es superuser
      const { data: currentUserProfile, error: profileError } = await supabase
        .from('user_accounts')
        .select('role')
        .eq('id', session.user.id)
        .single();
        
      if (profileError || currentUserProfile?.role !== 'superuser') {
        toast.error('No tienes permisos para administrar usuarios');
        setLoading(false);
        return;
      }

      // Obtener todos los usuarios de user_accounts
      const { data, error } = await supabase
        .from('user_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        toast.error('Error al cargar usuarios');
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        setUsers(data);
      } else {
        // Si no hay usuarios en user_accounts, es posible que necesitemos sincronizar
        toast.info('No hay usuarios registrados en el sistema');
        setUsers([]);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    fetchUsers,
    addUserManually,
    deleteUser
  };
};
