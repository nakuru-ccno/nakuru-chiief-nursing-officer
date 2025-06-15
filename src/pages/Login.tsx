import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

function isEmail(text: string) {
  // Simple email validation
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

        if (data?.user && data.user.email) {
          // Fetch user profile to check status
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('status')
            .eq('email', data.user.email)
            .maybeSingle();

          if (profileError || !profile) {
            setError(
              "Your account could not be validated. Please contact admin if issues persist."
            );
            setLoading(false);
            return;
          }
          if (profile.status !== "active") {
            setError(
              "Your account is pending admin approval. Please wait for an admin to activate your account."
            );
            setLoading(false);
            // Log out the user if they are not active
            await supabase.auth.signOut();
            return;
          }

          // Allow admin to login directly
          if (
            userData.username === "admin@nakuru.go.ke" ||
            data.user?.user_metadata?.name === "System Administrator"
          ) {
            localStorage.setItem("role", "System Administrator");
          }

          navigate("/dashboard", { replace: true });
        } else {
          setError("Invalid credentials or account not confirmed.");
        }
      } else {
        setError("Please enter a valid email address.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    }
    setLoading(false);
  };

  const handleCreateAccountClick = (e: React.MouseEvent) => {
    // Let React Router handle navigation
  };

  const handleSignInClick = () => {};

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
                Email Address
              </label>
              <input
                id="username"
                name="username"
                type="email"
                onChange={handleChange}
                value={userData.username}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#be2251] focus:border-transparent"
                autoFocus
                required
                autoComplete="email"
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
              onClick={handleSignInClick}
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
                onClick={handleCreateAccountClick}
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
