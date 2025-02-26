
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useUserProfile = () => {
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error de sesión:', sessionError);
        throw sessionError;
      }
      
      if (!session) {
        setIsLoading(false);
        return;
      }

      console.log('ID del usuario:', session.user.id); // Para debugging

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error('Error al obtener perfil:', error);
        throw error;
      }

      console.log('Datos del perfil:', data); // Para debugging

      if (data) {
        setProfile(data);
        setIsSuperUser(data.role === 'superuser');
      } else {
        console.log('No se encontró perfil para el usuario');
        setProfile(null);
        setIsSuperUser(false);
      }
    } catch (error: any) {
      console.error('Error al cargar perfil:', error);
      toast.error("Error al cargar la información del perfil: " + (error.message || 'Error desconocido'));
      setProfile(null);
      setIsSuperUser(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Escuchar cambios en la sesión
  useEffect(() => {
    fetchProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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

  return { isSuperUser, profile, isLoading };
};
