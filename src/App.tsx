import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Activities from "./pages/Activities";
import Reports from "./pages/Reports";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import LiveAdmin from "./pages/LiveAdmin";
import AdminSettings from "./pages/AdminSettings";

function ProtectedRoute() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      console.log("ProtectedRoute - Checking authentication...");
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        console.log("ProtectedRoute - Supabase session found");
        setIsAuthenticated(true);
        return;
      }

      const demoRole = localStorage.getItem("role");
      if (demoRole) {
        console.log("ProtectedRoute - Demo role found:", demoRole);
        setIsAuthenticated(true);
        return;
      }

      console.log("ProtectedRoute - No authentication found");
      setIsAuthenticated(false);
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter> {/* ✅ Correct: No basename needed for custom domain */}
        <TooltipProvider>
          <div className="App">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
                <Route path="/live-admin" element={<LiveAdmin />} />
                <Route path="/activities" element={<Activities />} />
                <Route path="/reports" element={<Reports />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
