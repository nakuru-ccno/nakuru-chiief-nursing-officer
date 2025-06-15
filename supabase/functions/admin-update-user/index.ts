
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { user_id, new_email, new_password, new_role } = body as {
      user_id: string;
      new_email?: string;
      new_password?: string;
      new_role?: string;
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

    // Compose update object
    const updateData: Record<string, any> = {};
    if (new_email) updateData.email = new_email;
    if (new_password) updateData.password = new_password;

    // Perform Auth user update if relevant
    let authError = null;
    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase.auth.admin.updateUserById(user_id, updateData);
      authError = error;
    }

    // Optionally, update user metadata (for role)
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
