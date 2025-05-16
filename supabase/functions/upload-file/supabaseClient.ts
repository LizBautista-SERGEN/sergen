
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

// Create and export Supabase client
export const createSupabaseClient = () => {
  try {
    console.log("Supabase URL:", Deno.env.get('SUPABASE_URL'));
    console.log("Service role key length:", (Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '').length);
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    console.log("Supabase client created successfully");
    return supabase;
  } catch (error) {
    console.error("Error creating Supabase client:", error);
    throw new Error('Error initializing Supabase client');
  }
};
