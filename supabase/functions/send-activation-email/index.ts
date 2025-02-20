
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  businessName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, businessName }: EmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "SERGEN <onboarding@resend.dev>",
      to: ["victoria_bautista@sergen.pe"], // Email del administrador
      subject: "Nueva solicitud de activación de cuenta",
      html: `
        <h1>Nueva solicitud de activación de cuenta</h1>
        <p>Se ha registrado una nueva empresa que requiere activación:</p>
        <ul>
          <li><strong>Empresa:</strong> ${businessName}</li>
          <li><strong>Email:</strong> ${email}</li>
        </ul>
        <p>Por favor, ingrese al panel de administración para activar esta cuenta.</p>
      `,
    });

    // También enviamos un email al usuario
    await resend.emails.send({
      from: "SERGEN <onboarding@resend.dev>",
      to: [email],
      subject: "Solicitud de activación recibida",
      html: `
        <h1>Solicitud de activación recibida</h1>
        <p>Estimado cliente de ${businessName},</p>
        <p>Hemos recibido su solicitud de registro. Su cuenta está pendiente de activación por nuestro equipo administrativo.</p>
        <p>Le notificaremos por correo electrónico cuando su cuenta haya sido activada.</p>
        <p>Si tiene alguna pregunta, por favor contáctenos.</p>
        <br>
        <p>Saludos cordiales,<br>Equipo SERGEN</p>
      `,
    });

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
