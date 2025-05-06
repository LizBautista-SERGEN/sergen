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

      // Obtener usuarios directamente de users_auth
      const { data: authUsers, error: authError } = await supabase
        .from('users_auth')
        .select('*')
        .order('created_at', { ascending: false });

      if (authError) {
        console.error('Error fetching auth users:', authError);
        toast.error('Error al cargar usuarios');
        setLoading(false);
        return;
      }

      console.log("Auth users from users_auth:", authUsers);

      // Obtener información adicional de user_accounts para complementar
      const { data: accountsData, error: accountsError } = await supabase
        .from('user_accounts')
        .select('*');

      if (accountsError) {
        console.error('Error fetching user accounts:', accountsError);
      }

      // Crear un mapa de cuentas de usuario para búsqueda rápida
      const accountsMap = new Map();
      if (accountsData) {
        accountsData.forEach(account => {
          accountsMap.set(account.id, account);
        });
      }

      // Mapear usuarios de users_auth y complementar con datos de user_accounts si existen
      if (authUsers && authUsers.length > 0) {
        const mappedUsers = authUsers.map(user => {
          const accountInfo = accountsMap.get(user.id);
          
          return {
            id: user.id,
            email: user.email || '',
            last_login: user.last_login,
            created_at: user.created_at,
            // Usar datos de user_accounts si existen, de lo contrario valores predeterminados
            role: accountInfo?.role || 'user',
            business_name: accountInfo?.business_name || null,
            has_access: accountInfo?.has_access !== false // Por defecto true si no existe
          };
        });
        
        setUsers(mappedUsers);
        console.log("Mapped users:", mappedUsers);
      } else {
        setUsers([]);
        toast.info('No hay usuarios registrados en el sistema');
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
      console.log('Adding user to user_accounts:', userId, userEmail, role);
      
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

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    fetchUsers,
    addUserManually,
    deleteUser,
    resetPassword
  };
};
