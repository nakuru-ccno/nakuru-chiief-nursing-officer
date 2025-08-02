import React from "react";
import { Outlet } from "react-router-dom";
import CountyHeader from "./CountyHeader";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* ✅ County Logo and Header at the very top */}
      <CountyHeader />

      {/* ✅ Main page content */}
      <main className="p-4 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
