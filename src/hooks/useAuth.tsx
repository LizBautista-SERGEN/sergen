
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setSession(null);
          if (window.location.pathname !== '/login') {
            navigate('/login');
          }
          return;
        }

        if (!session) {
          if (window.location.pathname !== '/login') {
            navigate('/login');
          }
          return;
        }

        setSession(session);
        
        // Validar el perfil del usuario
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, has_access')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          toast.error('Error al verificar el perfil');
          return;
        }

        if (!profile?.has_access) {
          toast.error('Su cuenta está pendiente de activación');
          await supabase.auth.signOut();
          setSession(null);
          navigate('/login');
          return;
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
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
        if (window.location.pathname !== '/login') {
          navigate('/login');
        }
        return;
      }

      if (_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED') {
        setSession(session);
        
        if (session) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role, has_access')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error('Error fetching profile:', profileError);
            toast.error('Error al verificar el perfil');
            return;
          }

          if (!profile?.has_access) {
            toast.error('Su cuenta está pendiente de activación');
            await supabase.auth.signOut();
            setSession(null);
            navigate('/login');
            return;
          }

          if (profile?.role === 'superuser') {
            navigate('/admin/dashboard');
          } else {
            navigate('/dashboard');
          }
        }
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return {
    session,
    loading,
  };
};
