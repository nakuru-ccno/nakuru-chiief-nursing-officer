
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Activity, FileText, LogIn, LogOut, Settings } from "lucide-react";

const MainNavbar = () => {
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem("role");
  const userRole = localStorage.getItem("role") || "";

  // Debug logging
  console.log("MainNavbar - Current role:", userRole);
  console.log("MainNavbar - Is logged in:", isLoggedIn);
  
  // Check if user is admin - enhanced detection
  const isAdmin = userRole === 'admin' || 
                  userRole === 'System Administrator' || 
                  userRole.toLowerCase().includes('admin');

  console.log("MainNavbar - Is admin:", isAdmin);

  // Don't show navigation items on landing, login, or register pages
  const isPublicPage = location.pathname === "/" || 
                       location.pathname === "/login" || 
                       location.pathname === "/register";

  // Navigation items for regular users
  const userNavItems = [
    { to: "/dashboard", label: "Dashboard", icon: Home },
    { to: "/activities", label: "Daily Activities", icon: Activity },
    { to: "/reports", label: "Reports", icon: FileText },
  ];

  // Navigation items for admins - removed Users/Live Admin navigation
  const adminNavItems = [
    { to: "/admin", label: "Admin Dashboard", icon: Home },
    { to: "/reports", label: "Reports", icon: FileText },
    { to: "/activities", label: "Settings", icon: Settings },
  ];

  // Always show admin navigation for admin users, regardless of current route
  const navItems = isAdmin ? adminNavItems : userNavItems;
  
  console.log("MainNavbar - Selected nav items:", navItems.map(item => item.label));

  return (
    <nav className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-lg border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Navigation Links - only show if logged in and not on public pages */}
          <div className="flex space-x-1">
            {!isPublicPage && isLoggedIn && navItems.map(item => {
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

          {/* Auth Button - only show logout when logged in and not on public pages */}
          <div className="flex items-center">
            {isLoggedIn && !isPublicPage ? (
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
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MainNavbar;
