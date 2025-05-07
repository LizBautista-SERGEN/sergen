
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

  // GET request for fetching documents
  if (req.method === 'GET') {
    try {
      // Initialize Supabase client with service role to bypass RLS policies
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      // Get user ID from either authentication token or query parameter
      let userId;
      
      try {
        // First try to get from auth
        const authHeader = req.headers.get('Authorization');
        if (authHeader) {
          const token = authHeader.replace('Bearer ', '');
          const { data: { user }, error } = await supabase.auth.getUser(token);
          if (!error && user) {
            userId = user.id;
            console.log('User ID from auth:', userId);
          }
        }
      } catch (error) {
        console.error('Error extracting user ID from auth:', error);
      }
      
      // If we don't have a userId yet, get it from URL params
      if (!userId) {
        const url = new URL(req.url);
        userId = url.searchParams.get('userId');
        console.log('User ID from URL param:', userId);
      }

      // Default to invoice type
      const type = 'invoice';

      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'Missing userId parameter' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      console.log(`Fetching ${type} documents for user ${userId}`);

      // Direct query to the documents table
      const { data, error } = await supabase
        .from('documents')
        .select('id, filename, file_path, document_type, created_at, deleted')
        .eq('user_id', userId)
        .eq('document_type', type)
        .eq('deleted', false);

      if (error) {
        console.error('Error fetching documents:', error);
        throw new Error(`Error fetching documents: ${error.message}`);
      }

      return new Response(
        JSON.stringify(data || []),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } catch (error) {
      console.error('Function error:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
  }

  // POST request for file upload
  try {
    // Parse the form data
    const formData = await req.formData()
    const file = formData.get('file')
    const type = formData.get('type')
    const userId = formData.get('userId')

    console.log('Upload request received:', { type, userId, fileName: file?.name })

    if (!file || !type || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Determine the bucket name
    const bucketName = type === 'profile' ? 'profile_images' : 
                     type === 'contract' ? 'contracts' : 'invoices'
                     
    console.log(`Using bucket name: ${bucketName}`)

    try {
      // Check if the bucket exists, if not create it
      const { data: buckets, error: listError } = await supabase.storage.listBuckets()
      
      if (listError) {
        console.error('Error listing buckets:', listError)
        throw new Error(`Error listing buckets: ${listError.message}`)
      }
      
      const bucketExists = buckets.some(bucket => bucket.name === bucketName)
      
      if (!bucketExists) {
        console.log(`Bucket ${bucketName} does not exist, creating...`)
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 10485760, // 10MB
          allowedMimeTypes: ['image/*', 'application/pdf']
        })
        
        if (createError) {
          console.error(`Error creating bucket ${bucketName}:`, createError)
          throw new Error(`Error creating bucket: ${createError.message}`)
        }
        
        console.log(`Successfully created bucket ${bucketName}`)
      } else {
        console.log(`Bucket ${bucketName} already exists`)
      }

      // Create unique file name
      const fileExt = file.name.split('.').pop()
      const fileName = `${crypto.randomUUID()}.${fileExt}`
      const filePath = `${userId}/${fileName}`
      
      console.log(`Uploading to bucket: ${bucketName}, path: ${filePath}`)

      // Upload the file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          contentType: file.type,
          upsert: true
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw uploadError
      }

      console.log('File uploaded successfully')

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath)

      console.log('Generated public URL:', publicUrl)

      // Update user profile if profile image
      if (type === 'profile') {
        console.log('Updating user profile with new image URL')
        const { error: updateError } = await supabase
          .from('user_accounts')
          .update({ profile_image: publicUrl })
          .eq('id', userId)

        if (updateError) {
          console.error('Profile update error:', updateError)
          throw updateError
        }
      } else {
        // Add document entry if contract or invoice
        console.log('Adding document record')
        const { error: insertError } = await supabase
          .from('documents')
          .insert({
            user_id: userId,
            filename: file.name,
            file_path: filePath,
            document_type: type
          })

        if (insertError) {
          console.error('Document insert error:', insertError)
          throw insertError
        }
      }

      return new Response(
        JSON.stringify({ 
          message: 'File uploaded successfully',
          url: publicUrl
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    } catch (storageError) {
      console.error('Storage operation error:', storageError)
      return new Response(
        JSON.stringify({ error: `Storage operation failed: ${storageError.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
