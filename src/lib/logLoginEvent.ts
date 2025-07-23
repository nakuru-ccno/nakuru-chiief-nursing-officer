// src/lib/logLoginEvent.ts
import { supabase } from "@/integrations/supabase/client";

export async function logLoginEvent(user_id: string) {
  const { error } = await supabase.from("login_history").insert([
    {
      user_id,
      timestamp: new Date().toISOString(),
    },
  ]);

  if (error) {
    console.error("Failed to log login event:", error.message);
  }
}
