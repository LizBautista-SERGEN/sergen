
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "../types";
import { toast } from "sonner";

export const useUserManagementTab = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch users from user_accounts table
      let { data: userAccounts, error } = await supabase
        .from('user_accounts')
        .select('*');

      if (error) {
        throw error;
      }

      // Get last login from users_auth if available
      let { data: usersAuth, error: authError } = await supabase
        .from('users_auth')
        .select('id, last_login');

      if (authError) {
        console.error('Error fetching auth data:', authError);
        // Continue without auth data
      }

      // Merge data
      const authMap = new Map();
      if (usersAuth) {
        usersAuth.forEach(user => {
          authMap.set(user.id, user.last_login);
        });
      }

      const processedUsers = userAccounts ? userAccounts.map(user => ({
        ...user,
        last_login: authMap.get(user.id) || null
      })) : [];

      setUsers(processedUsers as User[]);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Error al cargar usuarios: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, fetchUsers };
};
