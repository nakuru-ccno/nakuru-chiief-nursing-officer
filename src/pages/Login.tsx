import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

function isEmail(text: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
}

const Login = () => {
  const [userData, setUserData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData((u) => ({ ...u, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isEmail(userData.username)) {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email: userData.username,
          password: userData.password,
        });

        if (loginError) {
          setError(loginError.message || "Invalid credentials. Please try again.");
          setLoading(false);
          return;
        }

        if (data?.user?.email) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("status, role")
            .eq("email", data.user.email)
            .maybeSingle();

          if (profileError || !profile) {
            setError("Your account could not be validated. Please contact admin.");
            setLoading(false);
            return;
          }

          if (profile.status !== "active") {
            setError("Your account is pending admin approval.");
            await supabase.auth.signOut();
            setLoading(false);
            return;
          }

          const userRole = profile.role || "Staff Nurse";
          localStorage.setItem("role", userRole);

          const isAdmin =
            userRole === "System Administrator" ||
            userRole.toLowerCase().includes("admin");

          navigate(isAdmin ? "/admin" : "/dashboard", { replace: true });
        } else {
          setError("Invalid credentials or account not confirmed.");
        }
      } else {
        setError("Please enter a valid email address.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://www.nakurucountychiefnursingofficer.site/login/callback",
      },
    });

    if (error) {
      navigate("/login-error");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col text-gray-800 dark:text-gray-100">
      {/* Header */}
      <div className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-6">
        <div className="max-w-md mx-auto flex flex-col items-center">
          <img
            src="/lovable-uploads/00cc8120-039e-4419-8b2b-e07e69d6fdd8.png"
            alt="Nakuru County Logo"
            className="h-20 w-20 mb-4"
          />
          <h1 className="text-2xl font-bold text-[#be2251] mb-1">Nakuru County</h1>
          <h2 className="text-lg font-semibold">Chief Nurse Officer Daily Activity Register</h2>
          <p className="text-sm italic text-gray-500 dark:text-gray-400">
            County of Unlimited Opportunities
          </p>
        </div>
      </div>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm dark:bg-red-900 dark:border-red-700 dark:text-red-100">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                id="username"
                name="username"
                type="email"
                onChange={handleChange}
                value={userData.username}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#be2251]"
                autoFocus
                required
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                onChange={handleChange}
                value={userData.password}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#be2251]"
                required
                autoComplete="current-password"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#be2251] text-white font-semibold py-3 px-4 rounded-md hover:bg-[#fd3572] transition-colors disabled:opacity-50"
              disabled={loading || !userData.username || !userData.password}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 text-center text-gray-400 text-sm font-medium">or</div>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white font-semibold py-3 px-4 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Sign in with Google
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-[#be2251] hover:text-[#fd3572] transition-colors"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
