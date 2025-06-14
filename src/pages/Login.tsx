import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import CountyHeader from "@/components/CountyHeader";
import { supabase } from "@/integrations/supabase/client";

const DEMO_ACCOUNTS = [
  { username: "admin", password: "StrongP@ssword1!", role: "admin" },
  { username: "nurse", password: "NursePower2!", role: "chief_nurse" },
];

function isEmail(text: string) {
  // Simple email validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
}

const Login = () => {
  const [userData, setUserData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Add redirect if user already logged in (via Supabase)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.user) navigate("/dashboard", { replace: true });
    });
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData((u) => ({ ...u, [e.target.name]: e.target.value }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // If username field is an email, use Supabase Auth.
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

        // On success: remove any demo role & redirect to dashboard
        localStorage.removeItem("role");
        navigate("/dashboard", { replace: true });
        setLoading(false);
        return;
      }

      // Otherwise, use demo login logic
      const found = DEMO_ACCOUNTS.find(
        (a) =>
          a.username === userData.username && a.password === userData.password
      );
      if (found) {
        localStorage.setItem("role", found.role);
        // For demo roles, do not authenticate via Supabase, just navigate
        if (found.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with County Info */}
      <div className="w-full bg-white border-b border-gray-200 py-6">
        <div className="max-w-md mx-auto flex flex-col items-center">
          <img
            src="/lovable-uploads/00cc8120-039e-4419-8b2b-e07e69d6fdd8.png"
            alt="Nakuru County Logo"
            className="h-20 w-20 mb-4"
          />
          <h1 className="text-2xl font-bold text-[#be2251] mb-1">Nakuru County</h1>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            Chief Nurse Officer Daily Activity Register
          </h2>
          <p className="text-sm text-gray-600 italic">
            County of Unlimited Opportunities
          </p>
        </div>
      </div>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                onChange={handleChange}
                value={userData.username}
                placeholder="Enter your username"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#be2251] focus:border-transparent"
                autoFocus
                required
                autoComplete="username"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                onChange={handleChange}
                value={userData.password}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#be2251] focus:border-transparent"
                required
                autoComplete="current-password"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#be2251] text-white font-semibold py-3 px-4 rounded-md hover:bg-[#fd3572] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#be2251] focus:ring-offset-2"
              disabled={loading || !userData.username.trim() || !userData.password.trim()}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-[#be2251] hover:text-[#fd3572] transition-colors focus:outline-none focus:underline"
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
