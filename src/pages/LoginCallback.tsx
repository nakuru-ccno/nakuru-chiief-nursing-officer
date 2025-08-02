import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// 🔄 Record login event
async function logLoginEvent(userId: string) {
  // Note: login_history table not accessible through current types
  // await supabase.from("login_history").insert({ user_id: userId });
}

const LoginCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const checkOrCreateProfileAndRedirect = async (
      userId: string,
      userEmail: string,
      fullName?: string
    ) => {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("status, role")
        .eq("email", userEmail)
        .maybeSingle();

      if (profileError) {
        setError("Failed to fetch your profile. Please try again.");
        return;
      }

      if (!profile) {
        const { error: insertError } = await supabase.from("profiles").insert([
          {
            id: userId,
            email: userEmail,
            full_name: fullName ?? "",
            role: "Staff Nurse",
            status: "pending",
            email_verified: true,
          },
        ]);

        if (insertError) {
          setError("Could not create your profile. Contact admin.");
          return;
        }

        await supabase.auth.signOut();
        setError("Your account has been created and is pending admin approval.");
        return;
      }

      if (profile.status !== "active") {
        await supabase.auth.signOut();
        setError("Your account is pending admin approval.");
        return;
      }

      // ✅ Log login event
      await logLoginEvent(userId);

      const userRole = profile.role || "Staff Nurse";
      localStorage.setItem("role", userRole);

      const isAdmin =
        userRole === "System Administrator" ||
        userRole.toLowerCase().includes("admin");

      navigate(isAdmin ? "/admin" : "/dashboard", { replace: true });
    };

    const fetchAndProcessUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        setError("Login failed or user data not available.");
        return;
      }

      const user = data.user;
      const email = user.email;
      const fullName =
        user.user_metadata?.full_name || user.user_metadata?.name || "";

      if (email) {
        await checkOrCreateProfileAndRedirect(user.id, email, fullName);
      } else {
        setError("Email not found in user metadata.");
      }
    };

    fetchAndProcessUser();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
      <div className="text-center max-w-sm p-6">
        {error ? (
          <div className="text-red-600 font-semibold">{error}</div>
        ) : (
          <div className="text-gray-700 dark:text-gray-300">
            Verifying your account, please wait...
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginCallback;
