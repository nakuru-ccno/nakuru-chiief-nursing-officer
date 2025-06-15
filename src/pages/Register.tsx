
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import CountyHeader from "@/components/CountyHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Register = () => {
  const [userData, setUserData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- Removed: "redirect if already logged in" effect ---

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData((u) => ({ ...u, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    const { error: regError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: "",
          role: "Staff Nurse",
        },
        emailRedirectTo: window.location.origin + "/login"
      }
    });

    if (!regError) {
      supabase
        .from("profiles")
        .update({ status: "pending", email_verified: false })
        .eq("email", userData.email);
    }

    if (regError) {
      setError(regError.message || "Registration failed.");
    } else {
      setSuccess(
        "Registration submitted! Your account must be approved by an admin before you can log in."
      );
      setUserData({ email: "", password: "" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <CountyHeader />
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded shadow-md p-8 w-full max-w-md mx-auto mt-10"
      >
        <h2 className="text-xl font-bold mb-4 text-[#fd3572]">
          Create Account
        </h2>
        {error && <div className="mb-2 text-red-600 font-semibold">{error}</div>}
        {success && (
          <div className="mb-4 text-green-600 font-semibold">
            {success}
            <div className="mt-2">
              <a
                href="/login"
                className="text-[#be2251] hover:text-[#fd3572] font-semibold underline"
              >
                Go to Login
              </a>
            </div>
          </div>
        )}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Email</label>
          <Input
            name="email"
            type="email"
            onChange={handleChange}
            value={userData.email}
            required
            disabled={loading || !!success}
            autoFocus
          />
        </div>
        <div className="mb-6">
          <label className="block font-semibold mb-1">Password</label>
          <Input
            name="password"
            type="password"
            onChange={handleChange}
            value={userData.password}
            required
            minLength={6}
            disabled={loading || !!success}
          />
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={loading || !!success}
        >
          {loading ? "Registering..." : "Register"}
        </Button>
        <div className="mt-4 text-sm text-center">
          <span>Already have an account? </span>
          <a
            href="/login"
            className="text-[#be2251] font-semibold hover:underline"
          >
            Log in
          </a>
        </div>
      </form>
      <div className="mt-2 text-xs text-center text-gray-500 opacity-70">
        You can log in immediately after registering.
      </div>
    </div>
  );
};

export default Register;
