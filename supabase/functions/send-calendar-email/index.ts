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

interface CalendarEmailRequest {
  email: string;
  event: {
    title: string;
    description?: string;
    date: string;
    start_time: string;
    end_time: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Send calendar email function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, event }: CalendarEmailRequest = await req.json();
    console.log("Sending calendar email to:", email, "for event:", event.title);

    // Send immediate confirmation email
    const emailResponse = await resend.emails.send({
      from: "Nakuru County <onboarding@resend.dev>",
      to: [email],
      subject: `Calendar Event Confirmation: ${event.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #be2251;">📅 Event Added Successfully</h1>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">${event.title}</h2>
            ${event.description ? `<p style="color: #666;"><strong>Description:</strong> ${event.description}</p>` : ''}
            <p style="color: #666;"><strong>Date:</strong> ${event.date}</p>
            <p style="color: #666;"><strong>Time:</strong> ${event.start_time} - ${event.end_time}</p>
          </div>
          <p style="color: #333;">Your calendar event has been successfully added. You will receive a reminder email 1 hour before the event.</p>
          <p style="color: #999; font-size: 12px;">
            Best regards,<br>
            Nakuru County - Chief Nurse Officer<br>
            County of Unlimited Opportunities
          </p>
        </div>
      `,
    });

    console.log("Immediate email sent successfully:", emailResponse);

    // Store the event in email_queue for reminder scheduling
    const eventDateTime = new Date(`${event.date}T${event.start_time}`);
    const reminderTime = new Date(eventDateTime.getTime() - 60 * 60 * 1000); // 1 hour before

    const { error: queueError } = await supabase
      .from("email_queue")
      .insert([
        {
          email,
          title: `Reminder: ${event.title}`,
          description: `This is a reminder that your event "${event.title}" is scheduled to start in 1 hour.`,
          start_time: eventDateTime.toISOString(),
          end_time: new Date(`${event.date}T${event.end_time}`).toISOString(),
          sent: false
        }
      ]);

    if (queueError) {
      console.error("Error adding to email queue:", queueError);
    } else {
      console.log("Event added to email queue for reminder");
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Event confirmation email sent successfully",
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-calendar-email function:", error);
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