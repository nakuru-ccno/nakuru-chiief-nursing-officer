import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CountyHeader from "@/components/CountyHeader";
import { supabase } from "@/integrations/supabase/client";

const DEMO_ACCOUNTS = [
  { username: "admin", password: "StrongP@ssword1!", role: "admin" },
  { username: "nurse", password: "NursePower2!", role: "chief_nurse" },
];

const Login = () => {
  const [userData, setUserData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData((u) => ({ ...u, [e.target.name]: e.target.value }));
  };

  // Add redirect if user already logged in (via Supabase)
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.user) navigate("/dashboard", { replace: true });
    });
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = DEMO_ACCOUNTS.find(
      (a) =>
        a.username === userData.username && a.password === userData.password
    );
    if (found) {
      localStorage.setItem("role", found.role);
      if (found.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } else {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center">
      <CountyHeader />
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded shadow-md p-8 w-full max-w-md mt-10"
      >
        <h2 className="text-xl font-bold mb-4 text-[#fd3572]">
          Chief Nurse Officer Login
        </h2>
        {error && (
          <div className="mb-2 text-red-600 font-semibold">{error}</div>
        )}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Username</label>
          <input
            name="username"
            onChange={handleChange}
            value={userData.username}
            className="w-full px-3 py-2 border rounded bg-gray-50"
            autoFocus
            required
          />
        </div>
        <div className="mb-6">
          <label className="block font-semibold mb-1">Password</label>
          <input
            type="password"
            name="password"
            onChange={handleChange}
            value={userData.password}
            className="w-full px-3 py-2 border rounded bg-gray-50"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-[#fd3572] text-white font-bold rounded py-2 transition hover:bg-[#be2251]"
        >
          Login
        </button>
        <div className="mt-4 text-sm text-center">
          <span>Don't have an account? </span>
          <a href="/register" className="text-[#be2251] font-semibold hover:underline">Register</a>
        </div>
      </form>
      <div className="mt-4 text-xs text-gray-200 opacity-60">
        <span>For demo: <strong>admin</strong>/<strong>StrongP@ssword1!</strong> (admin) or <strong>nurse</strong>/<strong>NursePower2!</strong> (chief nurse)</span>
      </div>
    </div>
  );
};
export default Login;
