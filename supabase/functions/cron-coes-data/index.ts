
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.1.0';
import { format } from 'https://deno.land/x/date_fns@v2.22.1/esm/format/index.js';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

Deno.serve(async () => {
  try {
    const today = new Date();
    const fechaStr = format(today, 'dd/MM/yyyy');
    
    const { data, error } = await supabase.functions.invoke('get-coes-data', {
      body: {
        fechaInicio: fechaStr,
        fechaFin: fechaStr
      }
    });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, message: 'Datos actualizados correctamente' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Error en la actualización programada:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
