
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import CountyHeader from "@/components/CountyHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const predefinedRoles = [
  "Staff Nurse",
  "Senior Nurse",
  "Nurse Officer",
  "Chief Nurse Officer",
  "Nakuru County Deputy Chief Nursing Officer",
  "Nakuru County Chief Nursing Officer"
];

const Register = () => {
  const [userData, setUserData] = useState({ email: "", password: "", role: "Staff Nurse" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Waits for profiles row to exist, then sets to "pending"
  const updateProfilePendingWithRetry = async (email: string, role: string, maxAttempts = 5, interval = 800) => {
    let attempts = 0;
    while (attempts < maxAttempts) {
      const { data, error } = await supabase
        .from("profiles")
        .update({ status: "pending", email_verified: false, role })
        .eq("email", email);
      // If at least one row updated, success!
      if (!error && (data?.length ?? 0) > 0) return true;
      // Check if profile exists, else wait and try again
      const { data: checkProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", email);
      if ((checkProfile?.length ?? 0) > 0) {
        // Profile exists, but not updated, so retry
        await new Promise(r => setTimeout(r, interval));
      } else {
        // Profile not yet created by trigger, wait and retry
        await new Promise(r => setTimeout(r, interval));
      }
      attempts++;
    }
    return false;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
          role: userData.role,
        },
        emailRedirectTo: window.location.origin + "/login"
      }
    });

    let pendingSuccess = false;
    if (!regError) {
      pendingSuccess = await updateProfilePendingWithRetry(userData.email, userData.role);
    }

    if (regError) {
      setError(regError.message || "Registration failed.");
    } else if (!pendingSuccess) {
      setError(
        "There was an issue marking your account for approval. Please contact support or try again."
      );
    } else {
      setSuccess(
        "Registration submitted! Your account must be approved by an admin before you can log in."
      );
      setUserData({ email: "", password: "", role: "Staff Nurse" });
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
        <div className="mb-4">
          <label className="block font-semibold mb-1">Role</label>
          <select
            name="role"
            value={userData.role}
            onChange={handleChange}
            className="w-full border rounded-md py-2 px-3 bg-background"
            disabled={loading || !!success}
            required
          >
            {predefinedRoles.map((role) => (
              <option value={role} key={role}>{role}</option>
            ))}
          </select>
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
        You must be approved by an admin after registering before you can log in.
      </div>
    </div>
  );
};

export default Register;
