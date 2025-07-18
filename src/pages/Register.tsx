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
  "County Reproductive Health cordinator",
  "Nakuru County Health Records Officer",
  "Nakuru County Mental Health Cordinator",
  "Chief Nurse Officer",
  "Nakuru County Deputy Chief Nursing Officer",
  "Nakuru County Chief Nursing Officer"
];

const Register = () => {
  const [userData, setUserData] = useState({
    email: "",
    full_name: "",
    password: "",
    role: "Staff Nurse"
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Waits for profiles row to exist, then sets to "pending"
  const updateProfilePendingWithRetry = async (
    email: string,
    role: string,
    full_name: string,
    maxAttempts = 5,
    interval = 800
  ) => {
    let attempts = 0;
    while (attempts < maxAttempts) {
      const { data, error } = await supabase
        .from("profiles")
        .update({ status: "pending", email_verified: false, role, full_name })
        .eq("email", email);

      const rows = (data ?? []) as any[];

      if (!error && rows.length > 0) return true;

      const { data: checkProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", email);

      const checkRows = (checkProfile ?? []) as any[];

      if (checkRows.length > 0) {
        await new Promise((r) => setTimeout(r, interval));
      } else {
        await new Promise((r) => setTimeout(r, interval));
      }
      attempts++;
    }
    return false;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
          full_name: userData.full_name,
          role: userData.role,
        },
        emailRedirectTo: window.location.origin + "/login",
      },
    });

    let pendingSuccess = false;
    let showAccountCreatedMessage = false;
    if (!regError) {
      showAccountCreatedMessage = true;
      pendingSuccess = await updateProfilePendingWithRetry(
        userData.email,
        userData.role,
        userData.full_name
      );
    }

    if (regError) {
      setError(regError.message || "Registration failed.");
    } else {
      setSuccess(
        "Registration submitted! Your account must be approved by an admin before you can log in."
      );
      setUserData({
        email: "",
        full_name: "",
        password: "",
        role: "Staff Nurse"
      });

      if (!pendingSuccess) {
        console.warn(
          "[Register] Account created but could not update status to pending/verified. Please notify admin if not visible."
        );
      }
    }
    setLoading(false);
  };

  // ✅ Google Sign-Up
  const handleGoogleRegister = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://www.nakurucountychiefnursingofficer.site/dashboard",
      },
    });

    if (error) {
      setError("Google sign-up failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <CountyHeader />
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded shadow-md p-8 w-full max-w-md mx-auto mt-10"
      >
        <h2 className="text-xl font-bold mb-4 text-[#fd3572]">Create Account</h2>

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
          <label className="block font-semibold mb-1">Full Name</label>
          <Input
            name="full_name"
            type="text"
            onChange={handleChange}
            value={userData.full_name}
            required
            disabled={loading || !!success}
            placeholder="Enter your full name"
            autoComplete="name"
          />
        </div>

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
              <option value={role} key={role}>
                {role}
              </option>
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

        {/* ✅ Google Sign-Up Button */}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleGoogleRegister}
            className="w-full flex items-center justify-center bg-white border border-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-md hover:bg-gray-50 transition-colors"
          >
            <img src="/google-icon.svg" alt="Google" className="w-5 h-5 mr-2" />
            Sign up with Google
          </button>
        </div>

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
