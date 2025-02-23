
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

  const checkProfile = async (session: Session) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, has_access')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        toast.error('Error al cargar el perfil');
        return null;
      }

      if (!profile?.has_access) {
        toast.error('Su cuenta está pendiente de activación');
        return null;
      }

      return profile.role as UserRole;
    } catch (error) {
      console.error('Error checking profile:', error);
      return null;
    }
  };

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

        const role = await checkProfile(session);
        if (!role) {
          await supabase.auth.signOut();
          setSession(null);
          setUserRole(null);
          navigate('/login');
          return;
        }

        setSession(session);
        setUserRole(role);
        setLoading(false);

        // Redirigir según el rol
        if (role === 'superuser' && window.location.pathname === '/login') {
          navigate('/admin/dashboard');
        } else if (role === 'user' && window.location.pathname === '/login') {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', _event);
      
      if (_event === 'SIGNED_OUT') {
        setSession(null);
        setUserRole(null);
        navigate('/login');
        return;
      }

      if (_event === 'SIGNED_IN' && session) {
        const role = await checkProfile(session);
        if (!role) {
          await supabase.auth.signOut();
          setSession(null);
          setUserRole(null);
          navigate('/login');
          return;
        }

        setSession(session);
        setUserRole(role);

        if (role === 'superuser') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
      
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
