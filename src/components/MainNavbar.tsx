
import React from "react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/activities", label: "Activities" },
  { to: "/reports", label: "Reports" },
];

const MainNavbar = () => {
  const location = useLocation();
  return (
    <nav className="w-full bg-[#111] flex items-center px-4 py-2 justify-between">
      <div className="flex gap-2">
        {navItems.map((item) => (
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
      <Link
        to="/login"
        className="text-xs px-4 py-2 rounded bg-[#fd3572] text-white font-bold shadow hover:bg-[#be2251] ml-2"
      >
        Chief Nurse Officer Login
      </Link>
    </nav>
  );
};

export default MainNavbar;
