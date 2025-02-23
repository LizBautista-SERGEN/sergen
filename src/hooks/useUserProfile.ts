
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useUserProfile = () => {
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setLoading(false);
          return;
        }

        // Intentamos obtener el perfil usando maybeSingle para evitar errores si no existe
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching profile:', error);
          toast.error("Error al cargar la información del perfil");
          return;
        }

        if (!data) {
          console.log('No profile found for user:', session.user.id);
          toast.error("No se encontró el perfil del usuario");
          return;
        }

        setProfile(data);
        setIsSuperUser(data.role === 'superuser');
      } catch (err) {
        console.error('Error in useUserProfile:', err);
        toast.error("Error al cargar el perfil");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return { isSuperUser, profile, loading };
};
