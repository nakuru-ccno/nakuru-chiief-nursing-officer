import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { logLoginEvent } from "@/lib/logLoginEvent";

function isEmail(text: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
}

const Login = () => {
  const [userData, setUserData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setUserData((u) => ({
      ...u,
      [name]: type === "checkbox" ? checked : value,
    }));
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
          setError(loginError.message || "Invalid credentials.");
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
            setError("Account could not be validated.");
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

          // ✅ Log login history
          await logLoginEvent(data.user.id);

          const isAdmin =
            userRole === "System Administrator" || userRole.toLowerCase().includes("admin");
          navigate(isAdmin ? "/admin" : "/dashboard", { replace: true });
        } else {
          setError("Invalid credentials or account not confirmed.");
        }
      } else {
        setError("Please enter a valid email.");
      }
    } catch {
      setError("An unexpected error occurred.");
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

      {/* Main Content */}
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

            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={userData.rememberMe}
                  onChange={handleChange}
                  className="mr-2"
                />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-[#be2251] hover:text-[#fd3572]"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-[#be2251] text-white font-semibold py-3 px-4 rounded-md hover:bg-[#fd3572] transition-colors disabled:opacity-50"
              disabled={loading || !userData.username || !userData.password}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="my-6 text-center text-gray-400 text-sm font-medium">or</div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white font-semibold py-3 px-4 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
              <path d="M533.5 278.4c0-17.4-1.5-34.1-4.3-50.3H272v95.2h146.9c-6.3 34.3-25.1 63.4-53.7 83v68h86.8c50.8-46.8 81.5-115.9 81.5-196z" fill="#4285f4" />
              <path d="M272 544.3c72.6 0 133.5-24.1 178-65.2l-86.8-68c-24.1 16.2-54.8 25.8-91.2 25.8-70.2 0-129.6-47.4-150.8-111.1H34.6v69.9C78.4 486.1 169.3 544.3 272 544.3z" fill="#34a853" />
              <path d="M121.2 325.8c-9.7-28.8-9.7-59.5 0-88.3V167.6H34.6c-33.6 66.7-33.6 143.5 0 210.2l86.6-68z" fill="#fbbc04" />
              <path d="M272 107.7c39.5-.6 77.4 14 106.3 41.2l79.1-79.1C404.7 24.8 340.6-.1 272 0 169.3 0 78.4 58.1 34.6 167.6l86.6 69.9C142.4 155.2 201.8 107.7 272 107.7z" fill="#ea4335" />
            </svg>
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
