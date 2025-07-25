// supabase/functions/calendar-notifier/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { event, user_email } = await req.json()

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "CCNO Calendar <ccno@nakurucountychiefnursingofficer.site>",
      to: user_email,
      subject: "New Calendar Event Added",
      html: `<p>A new event has been added:</p><pre>${JSON.stringify(event, null, 2)}</pre>`
    })
  })

  const result = await response.json()

  return new Response(JSON.stringify({ status: "sent", result }), {
    headers: { "Content-Type": "application/json" }
  })
})
