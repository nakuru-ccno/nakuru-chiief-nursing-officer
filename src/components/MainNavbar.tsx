import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Activity,
  FileText,
  LogOut,
  Settings,
  Calendar,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const MainNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    async function checkUserRole() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      let nextRole: string | null = null;

      if (session?.user?.email) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("email", session.user.email)
          .maybeSingle();

        if (profile?.role) {
          nextRole = profile.role;
          setIsLoggedIn(true);
        }
      }

      if (!nextRole) {
        nextRole = localStorage.getItem("role");
        if (nextRole) setIsLoggedIn(true);
      }

      setRole(nextRole);
    }

    checkUserRole();
  }, [location.pathname]);

  const userRole = role?.toLowerCase() || "";
  const isAdmin =
    userRole === "admin" ||
    userRole === "system administrator" ||
    userRole.includes("admin");

  const isPublicPage =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  const userNavItems = [
    { to: "/dashboard", label: "Dashboard", icon: Home },
    { to: "/activities", label: "Daily Activities", icon: Activity },
    { to: "/reports", label: "Reports", icon: FileText },
    { to: "/calendar", label: "Calendar", icon: Calendar },
  ];

  const adminNavItems = [
    { to: "/admin", label: "Admin Dashboard", icon: Home },
    { to: "/activities", label: "Activities", icon: Activity },
    { to: "/reports", label: "Reports", icon: FileText },
    { to: "/calendar", label: "Calendar", icon: Calendar },
    { to: "/admin", label: "User Management", icon: Settings },
  ];

  const navItems = userRole
    ? isAdmin
      ? adminNavItems
      : userNavItems
    : [];

  const shouldShowNavbar = !isPublicPage && isLoggedIn && navItems.length > 0;

  if (!shouldShowNavbar) return null;

  return (
    <nav className="w-full md:w-64 bg-primary text-white h-screen flex flex-col items-center md:items-start px-4 py-6 shadow-lg">
      {/* Logo & Title */}
      <div className="mb-8 flex flex-col items-center md:items-start text-center md:text-left">
        <img
          src="/nakuru-county-logo.png"
          alt="Nakuru County Logo"
          className="w-16 h-16 mb-2"
        />
        <div className="text-lg font-bold uppercase leading-tight">
          Nakuru County
        </div>
        <div className="text-xs">County of Unlimited Opportunities</div>
      </div>

      {/* Nav Items */}
      <ul className="space-y-2 w-full">
        {navItems.map(({ to, label, icon: Icon }) => {
          const isActive = location.pathname.startsWith(to);
          return (
            <li key={to}>
              <Link
                to={to}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md w-full",
                  isActive
                    ? "bg-white/20 font-semibold"
                    : "hover:bg-white/10 transition-all"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Logout Button */}
      <button
        onClick={async () => {
          await supabase.auth.signOut();
          localStorage.removeItem("role");
          navigate("/login");
        }}
        className="mt-auto flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10 w-full"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </nav>
  );
};

export default MainNavbar;
