
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export type UserRole = 'superuser' | 'user' | null;

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setSession(null);
          setUserRole(null);
          navigate('/login');
          return;
        }

        if (!session) {
          navigate('/login');
          return;
        }

        // Verificar el rol del usuario
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, has_access')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setSession(null);
          setUserRole(null);
          navigate('/login');
          return;
        }

        if (!profile?.has_access) {
          toast.error('Su cuenta está pendiente de activación');
          await supabase.auth.signOut();
          setSession(null);
          setUserRole(null);
          navigate('/login');
          return;
        }

        setSession(session);
        setUserRole(profile.role as UserRole);
        setLoading(false);
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        setSession(null);
        setUserRole(null);
        navigate('/login');
        return;
      }

      // Verificar el rol del usuario cuando cambia el estado de autenticación
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, has_access')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile?.has_access) {
        setSession(null);
        setUserRole(null);
        navigate('/login');
        return;
      }

      setSession(session);
      setUserRole(profile.role as UserRole);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return {
    session,
    loading,
    userRole,
  };
};
