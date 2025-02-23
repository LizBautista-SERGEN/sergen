
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
    // Obtener la sesión actual
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          if (error.message.includes('Invalid Refresh Token')) {
            console.log('Token de actualización inválido');
            setSession(null);
            // Solo redirigimos al login si no estamos ya en la página de login
            if (window.location.pathname !== '/login') {
              navigate('/login');
            }
          } else {
            console.error('Error getting session:', error);
            toast.error('Error al verificar la sesión');
          }
        } else {
          setSession(session);
          if (session) {
            // Validar el perfil del usuario
            const { data: profile } = await supabase
              .from('profiles')
              .select('role, has_access')
              .eq('id', session.user.id)
              .single();

            if (!profile?.has_access) {
              toast.error('Su cuenta está pendiente de activación');
              await supabase.auth.signOut();
              setSession(null);
              navigate('/login');
            }
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Escuchar cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', _event);
      
      if (_event === 'SIGNED_OUT') {
        setSession(null);
        // Solo redirigimos al login si no estamos ya en la página de login
        if (window.location.pathname !== '/login') {
          navigate('/login');
        }
      } else if (_event === 'SIGNED_IN') {
        setSession(session);
        // Validamos el perfil del usuario
        if (session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, has_access')
            .eq('id', session.user.id)
            .single();

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
      } else if (_event === 'TOKEN_REFRESHED') {
        setSession(session);
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
