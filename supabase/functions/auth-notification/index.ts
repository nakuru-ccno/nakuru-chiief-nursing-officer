import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuthNotificationRequest {
  record: {
    id: string;
    email: string;
    email_confirmed_at?: string;
    user_metadata?: any;
  };
  type: 'INSERT';
  table: 'users';
  schema: 'auth';
  old_record: null;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookPayload: AuthNotificationRequest = await req.json();
    console.log("Received webhook payload:", webhookPayload);

    const { record } = webhookPayload;
    const email = record.email;
    const isEmailConfirmed = !!record.email_confirmed_at;
    const userName = record.user_metadata?.full_name || email;

    // Determine notification type
    const notificationType = isEmailConfirmed ? 'signin' : 'signup';

    // Send welcome/signin email
    let emailSubject: string;
    let emailContent: string;

    if (notificationType === 'signup') {
      emailSubject = "Welcome to Nakuru County Portal!";
      emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Welcome to Nakuru County!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">County of Unlimited Opportunities</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName}!</h2>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              Thank you for registering with the Nakuru County Portal. Your account has been created successfully!
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #333; margin-top: 0;">What's Next?</h3>
              <ul style="color: #555; line-height: 1.6;">
                <li>Your account is currently pending approval</li>
                <li>An administrator will review and activate your account shortly</li>
                <li>You'll receive an email notification once approved</li>
                <li>After approval, you can access all portal features</li>
              </ul>
            </div>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; color: #1976d2; font-weight: bold;">
                📧 Email: ${email}
              </p>
            </div>
            
            <p style="color: #555; line-height: 1.6;">
              If you have any questions, please contact our support team.
            </p>
            
            <p style="color: #777; font-size: 14px; margin-top: 30px;">
              Best regards,<br>
              The Nakuru County Team
            </p>
          </div>
        </div>
      `;
    } else {
      emailSubject = "Welcome back to Nakuru County Portal";
      emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Welcome Back!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Nakuru County Portal</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName}!</h2>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              You have successfully signed in to the Nakuru County Portal.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
              <h3 style="color: #333; margin-top: 0;">Portal Features Available:</h3>
              <ul style="color: #555; line-height: 1.6;">
                <li>📊 Dashboard - View your activities and reports</li>
                <li>📝 Activities - Log and manage your work activities</li>
                <li>📅 Calendar - Schedule and track events</li>
                <li>📈 Reports - Generate and export activity reports</li>
              </ul>
            </div>
            
            <div style="background: #e8f5e8; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; color: #2e7d32; font-weight: bold;">
                🔐 Signed in as: ${email}
              </p>
            </div>
            
            <p style="color: #555; line-height: 1.6;">
              Enjoy using the portal and thank you for your service to Nakuru County!
            </p>
            
            <p style="color: #777; font-size: 14px; margin-top: 30px;">
              Best regards,<br>
              The Nakuru County Team
            </p>
          </div>
        </div>
      `;
    }

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "Nakuru County <noreply@nakuru.go.ke>",
      to: [email],
      subject: emailSubject,
      html: emailContent,
    });

    console.log("Email sent successfully:", emailResponse);

    // Log notification in database
    const { error: dbError } = await supabase
      .from('email_notifications')
      .insert({
        user_id: record.id,
        email: email,
        notification_type: notificationType,
        template_data: {
          user_name: userName,
          email: email
        },
        status: 'sent'
      });

    if (dbError) {
      console.error("Error logging notification:", dbError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        notification_type: notificationType,
        email_id: emailResponse.data?.id 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Error in auth-notification function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);