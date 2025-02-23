
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
        throw error;
      }

      if (!profile || !profile.has_access) {
        console.log('No profile or access denied');
        return null;
      }

      return profile.role as UserRole;
    } catch (err) {
      console.error('Error in checkUserProfile:', err);
      return null;
    }
  };

  const handleAuthChange = async (session: Session | null) => {
    if (!session) {
      console.log('No session, clearing state');
      setSession(null);
      setUserRole(null);
      return;
    }

    try {
      const role = await checkUserProfile(session.user.id);
      if (role) {
        console.log('Setting session and role:', role);
        setSession(session);
        setUserRole(role);
      } else {
        console.log('No valid role found, signing out');
        await supabase.auth.signOut();
        setSession(null);
        setUserRole(null);
        toast.error('No tienes acceso a esta aplicación');
      }
    } catch (error) {
      console.error('Error handling auth change:', error);
      toast.error('Error al verificar el perfil');
    }
  };

  useEffect(() => {
    // Verificar sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session ? 'Session exists' : 'No session');
      handleAuthChange(session);
      setLoading(false);
    });

    // Suscribirse a cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed, session:', session ? 'exists' : 'none');
      handleAuthChange(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { session, loading, userRole };
};
