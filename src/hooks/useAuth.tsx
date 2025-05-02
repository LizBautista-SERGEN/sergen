
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
    // Set up auth state listener first
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
        // When a session exists, update last_login in users_auth
        setTimeout(() => {
          supabase
            .from('users_auth')
            .update({ last_login: new Date().toISOString() })
            .eq('id', session.user.id)
            .then(({ error }) => {
              if (error) {
                console.error('Error updating last login:', error);
              }
            });
        }, 0);
      }
      
      setLoading(false);
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        setSession(null);
        setLoading(false);
        navigate('/login');
        return;
      }
      
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return {
    session,
    loading,
  };
};
