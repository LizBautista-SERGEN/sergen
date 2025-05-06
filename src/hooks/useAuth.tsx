
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperUser, setIsSuperUser] = useState(false);
  const navigate = useNavigate();

  const checkUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_accounts')
        .select('role, has_access')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user role:', error);
        return false;
      }
      
      // Si el usuario no tiene acceso, cerrar sesión
      if (!data?.has_access) {
        toast.error('Su cuenta está suspendida. Contacte al administrador.');
        await supabase.auth.signOut();
        return false;
      }
      
      return data?.role === 'superuser';
    } catch (error) {
      console.error('Error checking user role:', error);
      return false;
    }
  };

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
          
          // Verificar si es superuser
          if (data.session?.user) {
            const isSuperUserResult = await checkUserRole(data.session.user.id);
            setIsSuperUser(isSuperUserResult);
          }
          
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
      async (_event, session) => {
        console.log('Auth state change:', _event);
        
        if (mounted) {
          setSession(session);
        
          if (_event === 'SIGNED_OUT') {
            setIsSuperUser(false);
            navigate('/login');
          } else if (_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED') {
            if (session?.user) {
              // Verificar si es superuser
              const isSuperUserResult = await checkUserRole(session.user.id);
              setIsSuperUser(isSuperUserResult);
              
              if (!isSuperUserResult) {
                navigate('/servicios/control');
              }
              
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
    isSuperUser,
  };
};
