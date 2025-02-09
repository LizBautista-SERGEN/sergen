
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file')
    const type = formData.get('type') // 'profile', 'contract', or 'invoice'
    const userId = formData.get('userId')

    if (!file || !type || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const fileExt = file.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${fileExt}`
    let bucketName = ''
    
    switch(type) {
      case 'profile':
        bucketName = 'profile_images'
        break
      case 'contract':
        bucketName = 'contracts'
        break
      case 'invoice':
        bucketName = 'invoices'
        break
      default:
        throw new Error('Invalid file type')
    }

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(`${userId}/${fileName}`, file, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      throw uploadError
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(`${userId}/${fileName}`)

    if (type === 'profile') {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId)

      if (updateError) throw updateError
    } else {
      const { error: insertError } = await supabase
        .from('documents')
        .insert({
          user_id: userId,
          filename: file.name,
          file_path: `${userId}/${fileName}`,
          document_type: type === 'contract' ? 'contract' : 'invoice'
        })

      if (insertError) throw insertError
    }

    return new Response(
      JSON.stringify({ 
        message: 'File uploaded successfully',
        url: publicUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
