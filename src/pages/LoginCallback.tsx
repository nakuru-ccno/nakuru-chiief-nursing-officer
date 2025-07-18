import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const LoginCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const checkOrCreateProfileAndRedirect = async (userEmail: string, fullName?: string) => {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("status, role")
        .eq("email", userEmail)
        .maybeSingle();

      if (error) {
        setError("Failed to fetch your profile. Please try again.");
        return;
      }

      if (!profile) {
        const { error: insertError } = await supabase.from("profiles").insert([
          {
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

      const userRole = profile.role || "Staff Nurse";
      localStorage.setItem("role", userRole);

      const isAdmin =
        userRole === "System Administrator" ||
        userRole.toLowerCase().includes("admin");

      navigate(isAdmin ? "/admin" : "/dashboard", { replace: true });
    };

    const fetchAndProcessUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user?.email) {
        await checkOrCreateProfileAndRedirect(data.user.email, data.user.user_metadata.full_name);
      } else {
        setError("Login failed or user data not available.");
      }
    };

    fetchAndProcessUser();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center max-w-sm p-6">
        {error ? (
          <div className="text-red-600 font-semibold">{error}</div>
        ) : (
          <div className="text-gray-700">Verifying your account, please wait...</div>
        )}
      </div>
    </div>
  );
};

export default LoginCallback;
