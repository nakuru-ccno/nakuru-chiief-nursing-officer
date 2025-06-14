
import React from "react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Home" },
  { to: "/activities", label: "Activities" },
  { to: "/reports", label: "Reports" },
];

const MainNavbar = () => {
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem("role");

  return (
    <nav className="w-full bg-[#111] flex items-center px-4 py-2 justify-between">
      <div className="flex gap-2">
        {navItems
          .filter(item => isLoggedIn || item.to === "/dashboard") // Only show activities/reports if logged in
          .map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`text-sm px-4 py-2 font-semibold rounded transition-all ${
                location.pathname === item.to
                  ? "bg-[#fd3572] text-white"
                  : "text-[#fd3572] hover:bg-[#251c21] hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
      </div>
      {!isLoggedIn ? (
        <Link
          to="/login"
          className="text-xs px-4 py-2 rounded bg-[#fd3572] text-white font-bold shadow hover:bg-[#be2251] ml-2"
        >
          Chief Nurse Officer Login
        </Link>
      ) : (
        <button
          className="text-xs px-4 py-2 rounded bg-[#be2251] text-white font-bold shadow hover:bg-[#fd3572] ml-2"
          onClick={() => {
            localStorage.removeItem("role");
            window.location.href = "/";
          }}
        >
          Logout
        </button>
      )}
    </nav>
  );
};

export default MainNavbar;
