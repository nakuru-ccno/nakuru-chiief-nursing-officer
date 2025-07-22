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

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://www.nakurucountychiefnursingofficer.site/reset-password",
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("A password reset link has been sent to your email.");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-[#be2251] mb-4 text-center">
          Forgot Your Password?
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center">
          Enter your email and we’ll send you a reset link.
        </p>

        <form onSubmit={handleReset} className="space-y-4">
          <label htmlFor="email" className="block text-sm font-medium">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#be2251]"
          />

          <button
            type="submit"
            className="w-full bg-[#be2251] text-white py-3 px-4 rounded-md font-semibold hover:bg-[#fd3572] transition-colors"
          >
            Send Reset Link
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm text-green-600 dark:text-green-400 text-center">
            {message}
          </p>
        )}
        {error && (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400 text-center">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

