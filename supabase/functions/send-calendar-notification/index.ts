// supabase/functions/send-calendar-notification/index.ts
import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  console.log("✅ Edge Function triggered");
  return new Response("Hello from Supabase Edge Function!", {
    headers: { "Content-Type": "text/plain" },
  });
});
