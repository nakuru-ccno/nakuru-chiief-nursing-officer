import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Activity, FileText, LogOut, Settings, Calendar as CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import CalendarBadge from "@/components/CalendarBadge"; // Ensure this exists

const MainNavbar = () => {
  const location = useLocation();
  const [role, setRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    async function checkUserRole() {
      const { data: { session } } = await supabase.auth.getSession();
      let nextRole = null;
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

  const userRole = role || "";
  const isAdmin =
    userRole === "admin" ||
    userRole === "System Administrator" ||
    userRole.toLowerCase().includes("admin");

  const isPublicPage =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  const userNavItems = [
    { to: "/dashboard", label: "Dashboard", icon: Home },
    { to: "/activities", label: "Daily Activities", icon: Activity },
    { to: "/reports", label: "Reports", icon: FileText },
    {
      to: "/calendar",
      label: (
        <>
          Calendar <CalendarBadge />
        </>
      ),
      icon: CalendarIcon,
    },
  ];

  const adminNavItems = [
    { to: "/admin", label: "Admin Dashboard", icon: Home },
    { to: "/activities", label: "Activities", icon: Activity },
    { to: "/reports", label: "Reports", icon: FileText },
    {
      to: "/calendar",
      label: (
        <>
          Calendar <CalendarBadge />
        </>
      ),
      icon: CalendarIcon,
    },
    { to: "/admin", label: "User Management", icon: Settings },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;
  const shouldShowNavbar = !isPublicPage && isLoggedIn && !!role;

  return shouldShowNavbar ? (
    <nav className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-lg border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
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
                  <span className="flex items-center gap-1">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

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
