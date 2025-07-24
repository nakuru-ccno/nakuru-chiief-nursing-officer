
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Activity, FileText, LogOut, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const MainNavbar = () => {
  const location = useLocation();
  const [role, setRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    // Check Supabase session for user and profile role
    async function checkUserRole() {
      // Try to get Supabase session user
      const { data: { session } } = await supabase.auth.getSession();
      let nextRole = null;
      if (session?.user?.email) {
        // Look up user profile for role
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
      // If not found, fallback to localStorage
      if (!nextRole) {
        nextRole = localStorage.getItem("role");
        if (nextRole) setIsLoggedIn(true);
      }
      setRole(nextRole);
    }
    checkUserRole();
  }, [location.pathname]); // Check role on navigation

  // Check if user is admin - enhanced detection
  const userRole = role || "";
  const isAdmin =
    userRole === "admin" ||
    userRole === "System Administrator" ||
    userRole.toLowerCase().includes("admin");

  // Only show navbar on authenticated pages, not on public pages
  const isPublicPage =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  // Navigation items for regular users
  const userNavItems = [
    { to: "/dashboard", label: "Dashboard", icon: Home },
    { to: "/activities", label: "Daily Activities", icon: Activity },
    { to: "/reports", label: "Reports", icon: FileText },
  ];

  // Navigation items for admins
  const adminNavItems = [
    { to: "/admin", label: "Admin Dashboard", icon: Home },
    { to: "/activities", label: "Activities", icon: Activity },
    { to: "/reports", label: "Reports", icon: FileText },
    { to: "/admin", label: "User Management", icon: Settings },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;
  const shouldShowNavbar = !isPublicPage && isLoggedIn && !!role;

  // Debug logs
  console.log("MainNavbar - Current path:", location.pathname);
  console.log("MainNavbar - Current role:", role);
  console.log("MainNavbar - Is logged in:", isLoggedIn);
  console.log("MainNavbar - Is public page:", isPublicPage);
  console.log("MainNavbar - shouldShowNavbar:", shouldShowNavbar);

  return shouldShowNavbar ? (
    <nav className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-lg border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Navigation Links - show for all logged in users */}
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

          {/* Auth Button */}
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
