// supabase/functions/event-notification/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { record } = await req.json();
  const { title, date, email } = record;

  if (!email) {
    return new Response("Missing user email", { status: 400 });
  }

  const { error } = await supabase.functions.invoke("welcome-email", {
    body: {
      to: email,
      subject: `📅 Upcoming Event: ${title}`,
      html: `
        <p>Hello,</p>
        <p>You have an upcoming event scheduled for <strong>${new Date(date).toLocaleDateString()}</strong>:</p>
        <h3>${title}</h3>
        <p>Please mark your calendar.</p>
        <br />
        <p>Best regards,<br/>Nakuru CNO Team</p>
      `,
    },
  });

  if (error) {
    console.error("Email error", error);
    return new Response("Failed to send email", { status: 500 });
  }

  return new Response("Email sent successfully", { status: 200 });
});
