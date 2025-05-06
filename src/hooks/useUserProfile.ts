
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ProfileType = {
  id: string;
  email: string;
  business_name: string | null;
  contact_name: string | null;
  position: string | null;
  profile_image: string | null;
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
  last_login?: string | null; // Make last_login optional
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
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        setError(sessionError.message);
        setIsLoading(false);
        return;
      }
      
      if (!session) {
        setIsLoading(false);
        return;
      }

      // Usar la tabla user_accounts directamente
      const { data, error: profileError } = await supabase
        .from('user_accounts')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setError(profileError.message);
        setIsLoading(false);
        return;
      }
      
      if (data) {
        // Create the user profile object with all properties from data
        // and explicitly set last_login to null
        const userProfile: ProfileType = {
          ...data,
          last_login: null, // Explicitly set last_login to null since it doesn't exist in the table
        };

        console.log('Profile loaded successfully:', userProfile);
        setProfile(userProfile);
        setIsSuperUser(userProfile.role === 'superuser');
      } else {
        console.log('No profile found for user');
        setProfile(null);
        setIsSuperUser(false);
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      setError(error.message || 'Unknown error');
      toast.error("Error loading profile information: " + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Refetch profile function to be called after updates
  const refetchProfile = () => {
    fetchProfile();
  };

  // Listen for session changes
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
