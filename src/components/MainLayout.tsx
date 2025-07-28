import React from "react";
import { Outlet } from "react-router-dom";
import MainNavbar from "./MainNavbar";
import CountyHeader from "./CountyHeader";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* ✅ County Logo and Header at the very top */}
      <CountyHeader />

      {/* ✅ Then the navigation menu below it */}
      <MainNavbar />

      {/* ✅ Main page content */}
      <main className="p-4 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
