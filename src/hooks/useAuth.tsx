
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
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        if (error.message.includes('Invalid Refresh Token')) {
          console.log('Token de actualización inválido, redirigiendo al login');
          setSession(null);
          setLoading(false);
          // Solo redirigimos al login si no estamos ya en la página de login
          if (window.location.pathname !== '/login') {
            navigate('/login');
          }
          return;
        }
        console.error('Error getting session:', error);
        toast.error('Error al verificar la sesión');
      }
      setSession(session);
      setLoading(false);
    });

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
