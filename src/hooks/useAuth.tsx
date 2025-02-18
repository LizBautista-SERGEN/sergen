
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
        if (!error.message.includes('Invalid Refresh Token')) {
          console.error('Error getting session:', error);
          toast.error('Error al verificar la sesión');
        }
        // Si hay error de refresh token, redirigimos al login
        setSession(null);
        setLoading(false);
        navigate('/login');
        return;
      }
      setSession(session);
      setLoading(false);
    });

    // Escuchar cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'SIGNED_OUT' || _event === 'TOKEN_REFRESHED') {
        console.log('Auth state changed:', _event);
      }
      
      setSession(session);
      setLoading(false);
      
      if (!session) {
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return {
    session,
    loading,
  };
};
