import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      // 1. Check if user exists in the profiles table and is active
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("status")
        .eq("email", email)
        .maybeSingle();

      if (profileError || !profile) {
        setError("No account found with that email.");
        return;
      }

      if (profile.status !== "active") {
        setError("Your account is not approved. Contact admin.");
        return;
      }

      // 2. Try fetching the auth user (to make sure they registered)
      const { data: authUser, error: userError } = await supabase.auth.admin.getUserByEmail(email);

      if (userError || !authUser || !authUser.user) {
        setError("User is not registered. Please sign up first.");
        return;
      }

      // 3. Send reset link
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "https://www.nakurucountychiefnursingofficer.site/reset-password",
      });

      if (resetError) {
        setError("Something went wrong. Please try again later.");
      } else {
        setMessage("A password reset link has been sent to your email.");
      }
    } catch {
      setError("Unexpected error occurred.");
    }
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <h2 className="text-2xl font-bold mb-4">Forgot your password?</h2>
      <p className="text-sm text-gray-600 mb-6">
        Enter your email and we’ll send you a password reset link.
      </p>
      <form onSubmit={handleReset} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-md"
        />
        <button
          type="submit"
          className="w-full bg-[#be2251] text-white py-3 px-4 rounded-md hover:bg-[#fd3572]"
        >
          Send reset link
        </button>
      </form>
      {message && <p className="mt-4 text-green-600">{message}</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  );
};

export default ForgotPassword;
