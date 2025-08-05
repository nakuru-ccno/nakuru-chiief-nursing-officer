
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Activity, FileText, LogOut, Settings, Calendar, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const MainNavbar = () => {
  const location = useLocation();
  const [role, setRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    async function checkUserRole() {
      const { data: { session } } = await supabase.auth.getSession();
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

      // Fallback to localStorage if needed
      if (!nextRole) {
        nextRole = localStorage.getItem("role");
        if (nextRole) setIsLoggedIn(true);
      }

      setRole(nextRole);
    }

    checkUserRole();
  }, [location.pathname]);

  // Normalize role
  const userRole = role?.toLowerCase() || "";
  const isAdmin =
    userRole === "admin" ||
    userRole === "system administrator" ||
    userRole.includes("admin");

  const isPublicPage =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  // Navigation for users
  const userNavItems = [
    { to: "/dashboard", label: "Dashboard", icon: Home },
    { to: "/activities", label: "Daily Activities", icon: Activity },
    { to: "/reports", label: "Reports", icon: FileText },
    { to: "/calendar", label: "Calendar", icon: Calendar },
    { to: "/profile", label: "My Profile", icon: User },
  ];

  // Navigation for admins
  const adminNavItems = [
    { to: "/admin", label: "Admin Dashboard", icon: Home },
    { to: "/activities", label: "Activities", icon: Activity },
    { to: "/reports", label: "Reports", icon: FileText },
    { to: "/calendar", label: "Calendar", icon: Calendar },
    { to: "/profile", label: "My Profile", icon: User },
    { to: "/admin-settings", label: "User Management", icon: Settings },
  ];

  const navItems = userRole
    ? isAdmin
      ? adminNavItems
      : userNavItems
    : [];

  const shouldShowNavbar = !isPublicPage && isLoggedIn && navItems.length > 0;

  return shouldShowNavbar ? (
    <nav className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-lg border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Navigation Links */}
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-[#fd3572] to-[#be2251] text-white shadow-lg transform scale-105"
                      : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Logout Button */}
          <div className="flex items-center">
            <button
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              onClick={() => {
                localStorage.removeItem("role");
                window.location.href = "/";
              }}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  ) : null;
};

export default MainNavbar;
