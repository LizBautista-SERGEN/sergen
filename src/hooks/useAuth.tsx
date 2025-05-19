
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
    
    // Set up auth state listener FIRST to prevent missing auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log('Auth state change:', _event);
        
        if (mounted) {
          setSession(session);
        
          if (_event === 'SIGNED_OUT') {
            setIsSuperUser(false);
            // Remove immediate auto-navigation to prevent infinite loops if logout is triggered from login page
            if (window.location.pathname !== '/login') {
              navigate('/login');
            }
          } else if (_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED') {
            if (session?.user) {
              // We use setTimeout to avoid deadlock with other Supabase calls
              setTimeout(async () => {
                try {
                  // Verificar si es superuser
                  const isSuperUserResult = await checkUserRole(session.user.id);
                  setIsSuperUser(isSuperUserResult);
                  
                  // Actualizamos el último login directamente en user_accounts
                  supabase
                    .from('user_accounts')
                    .update({ updated_at: new Date().toISOString() })
                    .eq('id', session.user.id)
                    .then(({ error }) => {
                      if (error) {
                        console.error('Error updating timestamp:', error);
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

    // THEN check for existing session
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
