import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Home, Activity, FileText, Calendar, Settings, LogOut } from "lucide-react";

const MainNavbar = () => {
  const location = useLocation();
  const [role, setRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function checkUserRole() {
      const { data: { session } } = await supabase.auth.getSession();
      let currentRole: string | null = null;

      if (session?.user?.email) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("email", session.user.email)
          .maybeSingle();

        if (profile?.role) {
          currentRole = profile.role;
          setIsLoggedIn(true);
        }
      }

      if (!currentRole) {
        currentRole = localStorage.getItem("role");
        if (currentRole) setIsLoggedIn(true);
      }

      setRole(currentRole);
    }

    checkUserRole();
  }, [location.pathname]);

  const userRole = role?.toLowerCase() || "";
  const isAdmin = userRole.includes("admin");

  const navItems = isAdmin
    ? [
        { to: "/dashboard", label: "Admin Dashboard", icon: Home },
        { to: "/activities", label: "Activities", icon: Activity },
        { to: "/reports", label: "Reports", icon: FileText },
        { to: "/calendar", label: "Calendar", icon: Calendar },
        { to: "/admin", label: "User Management", icon: Settings },
      ]
    : [
        { to: "/dashboard", label: "Dashboard", icon: Home },
        { to: "/activities", label: "Daily Activities", icon: Activity },
        { to: "/reports", label: "Reports", icon: FileText },
        { to: "/calendar", label: "Calendar", icon: Calendar },
      ];

  const isPublicPage =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  if (isPublicPage || !isLoggedIn) return null;

  return (
    <nav className="w-full bg-gray-900 shadow-lg border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col items-center">
        {/* Logo Section */}
        <div className="text-center mb-2">
          <img src="/logo.png" alt="Nakuru County Logo" className="h-10 mx-auto" />
          <h1 className="text-white font-bold text-lg">Nakuru County</h1>
          <p className="text-gray-400 text-sm">County of Unlimited Opportunities</p>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center gap-4 mt-2">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-pink-600 text-white shadow"
                    : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Logout */}
        <button
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 transition-all"
          onClick={() => {
            localStorage.removeItem("role");
            supabase.auth.signOut();
            window.location.href = "/login";
          }}
        >
          <div className="flex items-center gap-2">
            <LogOut size={16} />
            Logout
          </div>
        </button>
      </div>
    </nav>
  );
};

export default MainNavbar;
