
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "../UsersTable";

export const useFetchUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log("Comenzando a cargar usuarios...");
      
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
        console.error("Error al verificar rol de usuario:", profileError);
        toast.error('No tienes permisos para administrar usuarios');
        setLoading(false);
        return;
      }

      // Obtener todos los usuarios de user_accounts
      const { data: accountsData, error: accountsError } = await supabase
        .from('user_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (accountsError) {
        console.error('Error fetching user accounts:', accountsError);
        toast.error('Error al cargar cuentas de usuario');
        setLoading(false);
        return;
      }

      console.log("Cuentas de usuario obtenidas:", accountsData?.length || 0);
      
      if (!accountsData || accountsData.length === 0) {
        console.log("No se encontraron cuentas de usuario en user_accounts");
        setUsers([]);
        setLoading(false);
        return;
      }

      // Construir la lista de usuarios directamente desde user_accounts
      const usersList = accountsData.map(account => {
        return {
          id: account.id,
          email: account.email,
          last_login: account.last_login || null,
          created_at: account.created_at,
          role: account.role || 'user',
          business_name: account.business_name || null,
          has_access: account.has_access !== false // Por defecto true si no existe
        };
      });
      
      console.log("Usuarios a mostrar:", usersList.length);
      setUsers(usersList);
      
    } catch (error) {
      console.error('Error en fetchUsers:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    fetchUsers
  };
};
