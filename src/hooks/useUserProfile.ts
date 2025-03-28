
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ProfileType = {
  id: string;
  email: string;
  business_name: string | null;
  contact_name: string | null;
  position: string | null;
  profile: string | null;
  corporate_email: string | null;
  phone: string | null;
  role: string;
  has_access: boolean;
  ruc: string | null;
  activity: string | null;
  electricity_provider: string | null;
  contracted_power: string | null;
  contract_expiration: string | null;
  notice_period: string | null;
};

export const useUserProfile = () => {
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Obtener sesión actual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error de sesión:', sessionError);
        setError(sessionError.message);
        return;
      }
      
      if (!session) {
        setIsLoading(false);
        return;
      }

      // Obtener perfil del usuario
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error al obtener perfil:', profileError);
        setError(profileError.message);
        throw profileError;
      }

      if (data) {
        console.log('Perfil cargado correctamente:', data);
        setProfile(data as ProfileType);
        setIsSuperUser(data.role === 'superuser');
      } else {
        console.log('No se encontró perfil para el usuario');
        setProfile(null);
        setIsSuperUser(false);
      }
    } catch (error: any) {
      console.error('Error al cargar perfil:', error);
      setError(error.message || 'Error desconocido');
      toast.error("Error al cargar la información del perfil: " + (error.message || 'Error desconocido'));
    } finally {
      setIsLoading(false);
    }
  };

  // Refetch profile function to be called after updates
  const refetchProfile = () => {
    fetchProfile();
  };

  // Escuchar cambios en la sesión
  useEffect(() => {
    fetchProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        fetchProfile();
      } else {
        setProfile(null);
        setIsSuperUser(false);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { isSuperUser, profile, isLoading, error, refetchProfile };
};
