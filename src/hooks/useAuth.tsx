
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
        console.error('Error getting session:', error);
        setSession(null);
        setLoading(false);
        navigate('/login');
        return;
      }
      setSession(session);

      if (session) {
        // Verificar si el usuario existe en users_auth
        supabase
          .from('users_auth')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data, error: userError }) => {
            if (userError) {
              console.error('Error verificando usuario:', userError);
              return;
            }
            
            if (data) {
              // Actualizar el último login
              supabase
                .from('users_auth')
                .update({ last_login: new Date().toISOString() })
                .eq('id', session.user.id);
            }
          });
      }

      setLoading(false);
    });

    // Escuchar cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'SIGNED_OUT') {
        console.log('Auth state changed: SIGNED_OUT');
        setSession(null);
        navigate('/login');
      } else if (_event === 'TOKEN_REFRESHED') {
        console.log('Auth state changed: TOKEN_REFRESHED');
      }
      
      setSession(session);
      
      if (session) {
        // Cuando se inicia sesión, verificar y actualizar users_auth
        supabase
          .from('users_auth')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data, error: userError }) => {
            if (userError && !userError.message.includes('No rows found')) {
              console.error('Error verificando usuario:', userError);
            }
            
            if (data) {
              // Actualizar el último login
              supabase
                .from('users_auth')
                .update({ last_login: new Date().toISOString() })
                .eq('id', session.user.id);
            }
          });
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
