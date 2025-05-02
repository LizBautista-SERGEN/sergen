
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
