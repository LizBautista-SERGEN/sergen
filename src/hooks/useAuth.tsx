
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
    // Primero obtenemos la sesión actual
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
        }
        
        setSession(session);
        setLoading(false);
      } catch (error) {
        console.error('Unexpected error getting session:', error);
        setLoading(false);
      }
    };

    getInitialSession();
    
    // Configuramos el listener para cambios de sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log('Auth state change:', _event);
        setSession(session);
        
        if (_event === 'SIGNED_OUT') {
          navigate('/login');
        } else if (_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            // Actualizamos el último login sin bloquear el flujo
            try {
              setTimeout(() => {
                supabase
                  .from('users_auth')
                  .update({ last_login: new Date().toISOString() })
                  .eq('id', session.user.id)
                  .then(({ error }) => {
                    if (error && !error.message.includes('JSON object requested')) {
                      console.error('Error updating last login:', error);
                    }
                  });
              }, 0);
            } catch (err) {
              console.error('Error in update attempt:', err);
            }
          }
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [navigate]);

  return {
    session,
    loading,
  };
};
