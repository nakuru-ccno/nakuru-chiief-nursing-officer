import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "npm:resend";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { user_id, new_email, new_password, new_role, full_name } = body as {
      user_id: string;
      new_email?: string;
      new_password?: string;
      new_role?: string;
      full_name?: string;
    };

    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const updateData: Record<string, any> = {};
    if (new_email) updateData.email = new_email;
    if (new_password) updateData.password = new_password;

    // Update Auth user
    let authError = null;
    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase.auth.admin.updateUserById(user_id, updateData);
      authError = error;
    }

    // Update user_metadata
    let metaError = null;
    if (new_role) {
      const { error: metaErr } = await supabase.auth.admin.updateUserById(user_id, {
        user_metadata: { role: new_role },
      });
      metaError = metaErr;
    }

    if (authError || metaError) {
      return new Response(JSON.stringify({ 
        error: authError?.message || metaError?.message || "Update failed" 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ✅ Send Welcome Email via Resend (if new_email exists)
    if (new_email) {
      const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);

      await resend.emails.send({
        from: "welcome@nakurucountynursing.site", // Or verified sender
        to: new_email,
        subject: "🎉 Welcome to Nakuru County Nurse Register!",
        html: `
          <h2>Karibu, ${full_name || "Nurse"}!</h2>
          <p>Your account has been updated/created successfully.</p>
          <p>If you're new, your account may be pending admin approval.</p>
          <br/>
          <p>We're glad to have you with us.</p>
          <p><strong>Nakuru County Health Directorate</strong></p>
        `,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
