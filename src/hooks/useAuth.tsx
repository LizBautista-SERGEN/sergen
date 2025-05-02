
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
    let mounted = true;
    
    // Función para obtener la sesión inicial
    const getInitialSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
        }
        
        // Solo actualizar el estado si el componente sigue montado
        if (mounted) {
          setSession(data.session);
          setLoading(false);
        }
      } catch (error) {
        console.error('Unexpected error getting session:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();
    
    // Configurar el listener para cambios de sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log('Auth state change:', _event);
        
        if (mounted) {
          setSession(session);
        
          if (_event === 'SIGNED_OUT') {
            navigate('/login');
          } else if (_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED') {
            if (session?.user) {
              // Actualizamos el último login sin bloquear el flujo usando setTimeout
              setTimeout(() => {
                try {
                  supabase
                    .from('users_auth')
                    .update({ last_login: new Date().toISOString() })
                    .eq('id', session.user.id)
                    .then(({ error }) => {
                      if (error && !error.message.includes('JSON object requested') && !error.message.includes('rows returned')) {
                        console.error('Error updating last login:', error);
                      }
                    });
                } catch (err) {
                  console.error('Error in update attempt:', err);
                }
              }, 0);
            }
          }
          
          setLoading(false);
        }
      }
    );

    // Cleanup function
    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [navigate]);

  return {
    session,
    loading,
    isAuthenticated: !!session,
  };
};
