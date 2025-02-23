
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

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          toast.error("Error al cargar la información del perfil");
          return;
        }

        setProfile(data);
        setIsSuperUser(data?.role === 'superuser');
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
