
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export type UserRole = 'superuser' | 'user' | null;

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session:', session); // Debug log

        if (!session) {
          console.log('No session found'); // Debug log
          setLoading(false);
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, has_access')
          .eq('id', session.user.id)
          .single();

        console.log('Profile data:', profile); // Debug log

        if (profileError) {
          console.error('Profile error:', profileError);
          setLoading(false);
          return;
        }

        if (!profile?.has_access) {
          toast.error('Su cuenta está pendiente de activación');
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        setSession(session);
        setUserRole(profile.role as UserRole);
        setLoading(false);
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session); // Debug log

      if (event === 'SIGNED_OUT' || !session) {
        setSession(null);
        setUserRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, has_access')
          .eq('id', session.user.id)
          .single();

        if (profileError || !profile?.has_access) {
          console.error('Profile error or no access:', profileError);
          setSession(null);
          setUserRole(null);
          setLoading(false);
          return;
        }

        setSession(session);
        setUserRole(profile.role as UserRole);
        setLoading(false);
      } catch (error) {
        console.error('Error in auth state change:', error);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return {
    session,
    loading,
    userRole,
  };
};
