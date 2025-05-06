
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

  // Function to ensure user exists in user_accounts
  const ensureUserAccount = async (userId: string, email: string, metadata: any) => {
    try {
      // First check if user already exists in user_accounts
      const { data: existingAccount, error: checkError } = await supabase
        .from('user_accounts')
        .select('id')
        .eq('id', userId)
        .single();
        
      if (checkError && !checkError.message.includes('JSON object requested')) {
        console.error('Error checking user account:', checkError);
      }
        
      // If user doesn't exist in user_accounts, create entry
      if (!existingAccount) {
        console.log('Creating new user_account for:', userId, email);
        const { error: insertError } = await supabase
          .from('user_accounts')
          .insert({
            id: userId,
            email: email.toLowerCase(),
            role: metadata?.role || 'user',
            business_name: metadata?.business_name || null,
            has_access: true
          });
            
        if (insertError) {
          console.error('Error creating user account:', insertError);
        }
      }
    } catch (error) {
      console.error('Error in ensureUserAccount:', error);
    }
  };

  const checkUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_accounts')
        .select('role, has_access')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user role:', error);
        
        // If the error is because the user doesn't exist in user_accounts
        // We can try to create the record based on the session data
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await ensureUserAccount(
            session.user.id, 
            session.user.email || '', 
            session.user.user_metadata
          );
          
          // Try fetching again after creating
          const { data: retryData, error: retryError } = await supabase
            .from('user_accounts')
            .select('role, has_access')
            .eq('id', userId)
            .single();
            
          if (retryError) {
            console.error('Error on retry fetching user role:', retryError);
            return false;
          }
          
          // Si el usuario no tiene acceso, cerrar sesión
          if (!retryData?.has_access) {
            toast.error('Su cuenta está suspendida. Contacte al administrador.');
            await supabase.auth.signOut();
            return false;
          }
          
          return retryData?.role === 'superuser';
        }
        
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
            // Ensure user exists in user_accounts table
            await ensureUserAccount(
              data.session.user.id,
              data.session.user.email || '',
              data.session.user.user_metadata
            );
            
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
              // Ensure user exists in user_accounts
              await ensureUserAccount(
                session.user.id,
                session.user.email || '',
                session.user.user_metadata
              );
              
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
