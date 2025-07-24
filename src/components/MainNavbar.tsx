import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Activity,
  FileText,
  LogOut,
  Settings,
  CalendarDays,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const CalendarBadge = () => {
  const { data, isLoading } = useQuery(["today-events"], async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("calendar_events")
      .select("id")
      .gte("start_time", `${today}T00:00:00`)
      .lt("start_time", `${today}T23:59:59`);
    if (error) return [];
    return data ?? [];
  });

  if (isLoading) return null;
  if (data && data.length > 0) {
    return <span className="ml-1 text-xs text-green-400">🟢</span>;
  }

  return null;
};

const MainNavbar = () => {
  const location = useLocation();
  const [role, setRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    async function checkUserRole() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
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
          Calendar
          <CalendarBadge />
        </>
      ),
      icon: CalendarDays,
    },
  ];

  const adminNavItems = [
    { to: "/admin", label: "Admin Dashboard", icon: Home },
    { to: "/activities", label: "Activities", icon: Activity },
    { to: "/reports", label: "Reports", icon: FileText },
    { to: "/admin", label: "User Management", icon: Settings },
    {
      to: "/calendar",
      label: (
        <>
          Calendar
          <CalendarBadge />
        </>
      ),
      icon: CalendarDays,
    },
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
                  key={item.to.toString()}
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
