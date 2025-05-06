
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

      // Intentar obtener los usuarios directamente de user_accounts
      // Esta tabla debería tener todas las cuentas de usuario y menos restricciones de acceso
      const { data: accountsData, error: accountsError } = await supabase
        .from('user_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (accountsError) {
        console.error('Error fetching user accounts:', accountsError);
        toast.error('Error al cargar cuentas de usuario');
      }

      console.log("Cuentas de usuario obtenidas:", accountsData?.length || 0);
      
      if (!accountsData || accountsData.length === 0) {
        console.log("No se encontraron cuentas de usuario en user_accounts");
        setUsers([]);
        setLoading(false);
        return;
      }

      // Intentar obtener información de login desde users_auth para complementar
      const { data: authUsers, error: authError } = await supabase
        .from('users_auth')
        .select('*');

      console.log("Usuarios de auth obtenidos:", authUsers?.length || 0);
      
      // Crear un mapa de usuarios de autenticación para búsqueda rápida
      const authMap = new Map();
      if (authUsers && authUsers.length > 0) {
        authUsers.forEach(user => {
          authMap.set(user.id, user);
        });
      }

      // Construir la lista de usuarios combinando ambas fuentes
      // pero partiendo de user_accounts que debería ser más accesible
      const combinedUsers = accountsData.map(account => {
        const authInfo = authMap.get(account.id);
        
        return {
          id: account.id,
          email: account.email,
          last_login: authInfo?.last_login || null,
          created_at: account.created_at,
          role: account.role || 'user',
          business_name: account.business_name || null,
          has_access: account.has_access !== false // Por defecto true si no existe
        };
      });
      
      console.log("Usuarios combinados a mostrar:", combinedUsers.length);
      setUsers(combinedUsers);
      
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
