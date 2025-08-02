import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Send reminder emails function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    console.log("Checking for events to remind between:", now.toISOString(), "and", oneHourFromNow.toISOString());

    // Get events that need reminders (events starting within the next hour that haven't been sent)
    const { data: eventsToRemind, error: fetchError } = await supabase
      .from("email_queue")
      .select("*")
      .eq("sent", false)
      .gte("start_time", now.toISOString())
      .lte("start_time", oneHourFromNow.toISOString());

    if (fetchError) {
      console.error("Error fetching events for reminders:", fetchError);
      throw fetchError;
    }

    console.log("Found", eventsToRemind?.length || 0, "events to send reminders for");

    if (!eventsToRemind || eventsToRemind.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "No reminder emails to send at this time",
        remindersSent: 0
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    let remindersSent = 0;
    const errors: string[] = [];

    for (const event of eventsToRemind) {
      try {
        console.log("Sending reminder for event:", event.title, "to:", event.email);

        // Send reminder email
        const emailResponse = await resend.emails.send({
          from: "Nakuru County <onboarding@resend.dev>",
          to: [event.email],
          subject: `🔔 Reminder: ${event.title} - Starting in 1 Hour`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #be2251;">🔔 Event Reminder</h1>
              <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2 style="color: #333; margin-top: 0;">⏰ Starting Soon: ${event.title}</h2>
                ${event.description ? `<p style="color: #666;"><strong>Description:</strong> ${event.description}</p>` : ''}
                <p style="color: #666;"><strong>Start Time:</strong> ${new Date(event.start_time).toLocaleString()}</p>
                <p style="color: #666;"><strong>End Time:</strong> ${new Date(event.end_time).toLocaleString()}</p>
              </div>
              <p style="color: #333; font-weight: bold;">This is a friendly reminder that your event is starting in approximately 1 hour.</p>
              <p style="color: #666;">Please make sure you're prepared and ready to attend.</p>
              <p style="color: #999; font-size: 12px;">
                Best regards,<br>
                Nakuru County - Chief Nurse Officer<br>
                County of Unlimited Opportunities
              </p>
            </div>
          `,
        });

        console.log("Reminder email sent successfully:", emailResponse);

        // Mark as sent in the database
        const { error: updateError } = await supabase
          .from("email_queue")
          .update({ sent: true })
          .eq("id", event.id);

        if (updateError) {
          console.error("Error updating sent status:", updateError);
          errors.push(`Failed to update sent status for event ${event.id}: ${updateError.message}`);
        } else {
          remindersSent++;
        }

      } catch (emailError: any) {
        console.error("Error sending reminder email for event", event.id, ":", emailError);
        errors.push(`Failed to send reminder for event ${event.id}: ${emailError.message}`);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Processed ${eventsToRemind.length} events, sent ${remindersSent} reminders`,
      remindersSent,
      errors: errors.length > 0 ? errors : undefined
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-reminder-emails function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);