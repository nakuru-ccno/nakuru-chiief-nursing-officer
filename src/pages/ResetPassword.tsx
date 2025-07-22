import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase handles token parsing from URL hash automatically
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setError("Reset link is invalid or has expired.");
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Password updated. Redirecting to login...");
      setTimeout(() => navigate("/login", { replace: true }), 3000);
    }

    setSubmitting(false);
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <h2 className="text-2xl font-bold mb-4">Reset Your Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-md"
        />
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm new password"
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-md"
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#be2251] text-white py-3 px-4 rounded-md hover:bg-[#fd3572]"
        >
          {submitting ? "Updating..." : "Update Password"}
        </button>
      </form>
      {message && <p className="mt-4 text-green-600">{message}</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  );
};

export default ResetPassword;
