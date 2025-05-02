
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

      // Get all users from user_accounts
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

      // Get current authenticated users from auth
      const { data: authUser, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error obteniendo usuario actual:', userError);
        toast.error('Error al verificar permisos');
        setLoading(false);
        return;
      }
      
      // Verificar si el usuario actual es superuser para poder continuar
      const { data: currentUserProfile, error: profileError } = await supabase
        .from('user_accounts')
        .select('role')
        .eq('id', authUser.user.id)
        .single();
        
      if (profileError || currentUserProfile?.role !== 'superuser') {
        toast.error('No tienes permisos para administrar usuarios');
        setLoading(false);
        return;
      }

      // Si hay datos, los devolvemos directamente
      if (data && data.length > 0) {
        setUsers(data);
        setLoading(false);
        return;
      }

      // Si no hay usuarios en user_accounts, es posible que necesitemos sincronizar
      toast.info('No hay usuarios registrados en el sistema');
      setUsers([]);

    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  // Función para sincronizar manualmente un usuario específico
  const syncUserByEmail = async (email: string) => {
    try {
      // Buscar usuario en Auth
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        toast.error('No se puede sincronizar: sin sesión');
        return false;
      }
      
      // Verificar si el usuario existe en user_accounts
      const { data: existingAccount } = await supabase
        .from('user_accounts')
        .select('id, email')
        .eq('email', email.toLowerCase())
        .single();
        
      if (existingAccount) {
        // Si ya existe, actualizamos el acceso
        const { error: updateError } = await supabase
          .from('user_accounts')
          .update({ has_access: true })
          .eq('id', existingAccount.id);
          
        if (updateError) {
          console.error('Error actualizando acceso:', updateError);
          return false;
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error sincronizando usuario:', error);
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
    syncUserByEmail
  };
};
