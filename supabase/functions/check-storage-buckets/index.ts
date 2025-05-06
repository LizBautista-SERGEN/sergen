
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // List buckets to check if our required buckets exist
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('Error listing buckets:', listError)
      throw new Error(`Error listing buckets: ${listError.message}`)
    }
    
    const requiredBuckets = ['invoices', 'contracts', 'profile_images'];
    const bucketsToCreate = [];
    const existingBuckets = [];
    
    for (const bucketName of requiredBuckets) {
      const bucketExists = buckets.some(bucket => bucket.name === bucketName);
      
      if (!bucketExists) {
        bucketsToCreate.push(bucketName);
      } else {
        existingBuckets.push(bucketName);
      }
    }
    
    // Create missing buckets
    const results = [];
    for (const bucketName of bucketsToCreate) {
      try {
        console.log(`Creating bucket ${bucketName}...`);
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        });
        
        if (createError) {
          results.push({
            bucket: bucketName,
            status: 'error',
            message: createError.message
          });
        } else {
          results.push({
            bucket: bucketName,
            status: 'created'
          });
          
          // Set public bucket policy
          const { error: policyError } = await supabase.storage.from(bucketName).createSignedUrl('test.txt', 60);
          if (policyError) {
            console.error(`Error setting public policy for ${bucketName}:`, policyError);
          }
        }
      } catch (e) {
        results.push({
          bucket: bucketName,
          status: 'error',
          message: e.message
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Storage buckets check completed',
        existing: existingBuckets,
        created: results.filter(r => r.status === 'created').map(r => r.bucket),
        errors: results.filter(r => r.status === 'error')
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
