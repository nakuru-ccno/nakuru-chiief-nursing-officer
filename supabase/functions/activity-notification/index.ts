import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.6';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ActivityNotificationRequest {
  activity: {
    title: string;
    type: string;
    date: string;
    duration?: number;
    facility?: string;
    description?: string;
    submitted_by: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log('📧 Activity notification function called');

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { activity }: ActivityNotificationRequest = await req.json();
    console.log('📧 Processing notification for activity:', activity.title);

    const emailResponse = await resend.emails.send({
      from: "Activities <onboarding@resend.dev>",
      to: [activity.submitted_by],
      subject: "Activity Logged Successfully",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">✅ Activity Logged Successfully!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your professional activity has been recorded</p>
          </div>
          
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #1e293b; margin: 0 0 20px 0;">Activity Details</h2>
            
            <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="color: #3b82f6; margin: 0 0 15px 0; font-size: 18px;">${activity.title}</h3>
              
              <div style="margin-bottom: 10px;">
                <strong style="color: #64748b;">Type:</strong> 
                <span style="color: #1e293b;">${activity.type}</span>
              </div>
              
              <div style="margin-bottom: 10px;">
                <strong style="color: #64748b;">Date:</strong> 
                <span style="color: #1e293b;">${new Date(activity.date).toLocaleDateString("en-GB")}</span>
              </div>
              
              ${activity.duration ? `
              <div style="margin-bottom: 10px;">
                <strong style="color: #64748b;">Duration:</strong> 
                <span style="color: #1e293b;">${activity.duration} minutes</span>
              </div>
              ` : ''}
              
              ${activity.facility ? `
              <div style="margin-bottom: 10px;">
                <strong style="color: #64748b;">Facility:</strong> 
                <span style="color: #1e293b;">${activity.facility}</span>
              </div>
              ` : ''}
              
              ${activity.description ? `
              <div style="margin-bottom: 10px;">
                <strong style="color: #64748b;">Description:</strong> 
                <span style="color: #1e293b;">${activity.description}</span>
              </div>
              ` : ''}
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #64748b; margin: 0;">
                This activity has been added to your professional record and can be viewed in your dashboard.
              </p>
            </div>
          </div>
          
          <div style="background: #1e293b; padding: 20px; text-align: center; color: white;">
            <p style="margin: 0; opacity: 0.7; font-size: 14px;">
              Thank you for keeping your professional activities up to date!
            </p>
          </div>
        </div>
      `,
    });

    console.log("📧 Activity notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("❌ Error in activity-notification function:", error);
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