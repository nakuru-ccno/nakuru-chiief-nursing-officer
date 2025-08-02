import React from "react";
import { Outlet } from "react-router-dom";
import CountyHeader from "./CountyHeader";
import MainNavbar from "./MainNavbar"; // 👈 Make sure this path is correct

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* ✅ County Logo and Header */}
      <CountyHeader />

      {/* ✅ Navigation menu */}
      <MainNavbar />

      {/* ✅ Main page content */}
      <main className="p-4 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
