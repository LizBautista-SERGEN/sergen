
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request for CORS');
    return new Response(null, { headers: corsHeaders })
  }

  // GET request for fetching documents
  if (req.method === 'GET') {
    try {
      console.log('Processing GET request to fetch documents');
      
      // Initialize Supabase client with service role to bypass RLS policies
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      // Get URL parameters correctly for GET request
      const url = new URL(req.url);
      const userId = url.searchParams.get('userId');
      const documentType = url.searchParams.get('type') || 'invoice';
      
      console.log(`Fetching ${documentType} documents for user ${userId}`);

      if (!userId) {
        console.error('Missing userId parameter');
        return new Response(
          JSON.stringify({ error: 'Missing userId parameter' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Direct query to the documents table
      const { data, error } = await supabase
        .from('documents')
        .select('id, filename, file_path, document_type, created_at, deleted')
        .eq('user_id', userId)
        .eq('document_type', documentType)
        .eq('deleted', false);

      if (error) {
        console.error('Error fetching documents:', error);
        throw new Error(`Error fetching documents: ${error.message}`);
      }

      console.log(`Successfully retrieved ${data?.length || 0} ${documentType} documents`);
      
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
    console.log('Upload request received');
    
    // Check Content-Type to ensure it's multipart/form-data
    const contentType = req.headers.get('Content-Type') || '';
    if (!contentType.includes('multipart/form-data')) {
      console.error('Invalid content type:', contentType);
      return new Response(
        JSON.stringify({ error: 'Content type must be multipart/form-data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Try to parse the form data
    let formData;
    try {
      formData = await req.formData();
      console.log('Form data successfully parsed');
    } catch (error) {
      console.error('Error parsing form data:', error);
      return new Response(
        JSON.stringify({ error: 'Could not parse form data: ' + error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Extract file and metadata from form data
    const file = formData.get('file');
    const type = formData.get('type') || 'invoice';
    const userId = formData.get('userId');

    console.log('Upload request parameters:', { 
      type, 
      userId, 
      fileName: file?.name,
      fileType: file instanceof File ? file.type : 'unknown',
      fileSize: file instanceof File ? file.size : 'unknown'
    });

    if (!file) {
      console.error('No file provided');
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    if (!userId) {
      console.error('Missing userId parameter');
      return new Response(
        JSON.stringify({ error: 'Missing userId parameter' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Determine the bucket name based on type
    const bucketName = type === 'profile' ? 'profiles' : 
                     type === 'contract' ? 'contracts' : 
                     type === 'report' ? 'reports' : 'invoices';
                     
    console.log(`Using bucket name: ${bucketName}`);

    try {
      // Check if the bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
      
      if (!bucketExists) {
        console.log(`Bucket ${bucketName} does not exist, creating...`);
        try {
          await supabase.storage.createBucket(bucketName, {
            public: true,
            fileSizeLimit: 10485760, // 10MB
          });
          console.log(`Successfully created bucket ${bucketName}`);
        } catch (bucketError) {
          // If we get an error that the bucket already exists, we can continue
          console.log(`Bucket creation error (may already exist): ${bucketError.message}`);
        }
      }

      // Create unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      
      console.log(`Uploading to bucket: ${bucketName}, path: ${filePath}`);

      // Upload the file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          contentType: file.type,
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('File uploaded successfully');

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      console.log('Generated public URL:', publicUrl);

      // Update user profile if profile image
      if (type === 'profile') {
        console.log('Updating user profile with new image URL');
        const { error: updateError } = await supabase
          .from('user_accounts')
          .update({ profile_image: publicUrl })
          .eq('id', userId);

        if (updateError) {
          console.error('Profile update error:', updateError);
          throw updateError;
        }
      } else {
        // Add document entry if contract, invoice or report
        console.log('Adding document record');
        
        // Ensure we're using a valid document_type
        const validDocumentTypes = ['invoice', 'contract', 'report'];
        let documentType = type;
        
        // Check if documentType is valid
        if (!validDocumentTypes.includes(documentType)) {
          console.warn(`Invalid document type: ${documentType}, defaulting to 'invoice'`);
          documentType = 'invoice';
        }
        
        const { error: insertError } = await supabase
          .from('documents')
          .insert({
            user_id: userId,
            filename: file.name,
            file_path: filePath,
            document_type: documentType
          });

        if (insertError) {
          console.error('Document insert error:', insertError);
          throw insertError;
        }
      }

      return new Response(
        JSON.stringify({ 
          message: 'File uploaded successfully',
          url: publicUrl
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } catch (storageError) {
      console.error('Storage operation error:', storageError);
      return new Response(
        JSON.stringify({ error: `Storage operation failed: ${storageError.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
})
