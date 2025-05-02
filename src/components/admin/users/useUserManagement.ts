
import { useState, useEffect } from "react";
import { User } from "./UsersTable";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User as SupabaseUser } from '@supabase/supabase-js';

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
        return;
      }

      // Verificar si hay usuarios en auth que no estén en user_accounts
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      
      if (!authError && authData?.users) {
        // Crear un mapa de usuarios existentes para búsqueda rápida
        const existingUserMap = new Map((data || []).map(user => [user.email.toLowerCase(), user]));
        
        // Usuarios que están en auth pero no en user_accounts
        const missingUsers = authData.users.filter(
          (authUser: SupabaseUser) => authUser.email && !existingUserMap.has(authUser.email.toLowerCase())
        );
        
        // Si hay usuarios faltantes, los agregamos a user_accounts
        if (missingUsers.length > 0) {
          const usersToAdd = missingUsers.map((user: SupabaseUser) => ({
            id: user.id,
            email: user.email || '',
            role: 'user',
            has_access: true,
            business_name: user.user_metadata?.business_name || null,
            created_at: user.created_at
          }));
          
          if (usersToAdd.length > 0) {
            const { error: insertError } = await supabase
              .from('user_accounts')
              .insert(usersToAdd);
              
            if (insertError) {
              console.error('Error synchronizing users:', insertError);
            } else {
              // Si se agregaron usuarios, actualizamos la lista
              const { data: updatedData, error: fetchError } = await supabase
                .from('user_accounts')
                .select('*')
                .order('created_at', { ascending: false });
                
              if (!fetchError && updatedData) {
                setUsers(updatedData);
                return;
              }
            }
          }
        }
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    fetchUsers
  };
};
