
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

  const checkUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, has_access')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      if (!profile || !profile.has_access) {
        return null;
      }

      return profile.role as UserRole;
    } catch (err) {
      console.error('Error in checkUserProfile:', err);
      return null;
    }
  };

  useEffect(() => {
    const setupAuth = async () => {
      try {
        // Obtener sesión inicial
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session check:', session ? 'Session exists' : 'No session');

        if (session) {
          const role = await checkUserProfile(session.user.id);
          if (role) {
            setSession(session);
            setUserRole(role);
            console.log('User role set:', role);
          } else {
            console.log('No valid profile found');
            await supabase.auth.signOut();
            setSession(null);
            setUserRole(null);
          }
        }
      } catch (error) {
        console.error('Error in setupAuth:', error);
      } finally {
        setLoading(false);
      }
    };

    setupAuth();

    // Suscribirse a cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);

      if (event === 'SIGNED_OUT' || !session) {
        setSession(null);
        setUserRole(null);
        if (window.location.pathname !== '/login') {
          navigate('/login');
        }
        return;
      }

      if (session) {
        const role = await checkUserProfile(session.user.id);
        if (role) {
          setSession(session);
          setUserRole(role);
          console.log('User role updated:', role);
          
          if (role === 'superuser' && window.location.pathname === '/login') {
            navigate('/admin/dashboard');
          } else if (role === 'user' && window.location.pathname === '/login') {
            navigate('/dashboard');
          }
        } else {
          console.log('Invalid profile after auth change');
          await supabase.auth.signOut();
          setSession(null);
          setUserRole(null);
          navigate('/login');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return { session, loading, userRole };
};
