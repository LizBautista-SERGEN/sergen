
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

export type UserRole = 'superuser' | 'user' | null;

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>(null);

  const checkUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error checking user role:', error);
        return null;
      }

      return (data?.role as UserRole) || 'user';
    } catch (error) {
      console.error('Error in checkUserRole:', error);
      return null;
    }
  };

  useEffect(() => {
    const setupSession = async (currentSession: Session | null) => {
      if (currentSession?.user?.id) {
        const role = await checkUserRole(currentSession.user.id);
        setUserRole(role);
      } else {
        setUserRole(null);
      }
      setSession(currentSession);
      setLoading(false);
    };

    // Verificar sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setupSession(session);
    });

    // Suscribirse a cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setupSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { session, loading, userRole };
};
