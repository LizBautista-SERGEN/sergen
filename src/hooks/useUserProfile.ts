
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useUserProfile = () => {
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error al cargar perfil:', error);
        toast.error("Error al cargar la información del perfil");
        return;
      }

      setProfile(data);
      setIsSuperUser(data?.role === 'superuser');
    }
  };

  return { isSuperUser, profile };
};
