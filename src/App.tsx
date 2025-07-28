import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import LoginCallback from "./pages/LoginCallback";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import LiveAdmin from "./pages/LiveAdmin";
import AdminSettings from "./pages/AdminSettings";
import Activities from "./pages/Activities";
import Reports from "./pages/Reports";
import CalendarPage from "./pages/CalendarPage";

// Layout
import MainLayout from "@/components/MainLayout";

// 🔐 Protect routes with auth + status check
function ProtectedRoute() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;

      if (user) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("status")
          .eq("email", user.email)
          .maybeSingle();

        if (error || !profile || profile.status !== "active") {
          await supabase.auth.signOut();
          setIsAuthenticated(false);
          return;
        }

        setIsAuthenticated(true);
        return;
      }

      const demoRole = localStorage.getItem("role");
      if (demoRole) {
        setIsAuthenticated(true);
        return;
      }

      setIsAuthenticated(false);
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Verifying your account...</div>
      </div>
    );
  }

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
}

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <div className="App">
            <Routes>
              {/* 🌐 Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login/callback" element={<LoginCallback />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* 🔒 Protected Routes with Layout */}
              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/admin/settings" element={<AdminSettings />} />
                  <Route path="/live-admin" element={<LiveAdmin />} />
                  <Route path="/activities" element={<Activities />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                </Route>
              </Route>

              {/* 404 Fallback */}
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
