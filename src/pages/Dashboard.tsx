
import React from "react";
import MainNavbar from "@/components/MainNavbar";
import CountyHeader from "@/components/CountyHeader";
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <CountyHeader />
      <MainNavbar />
      <div className="max-w-3xl mx-auto px-6 pt-8">
        <h2 className="text-2xl font-bold mb-4 text-[#be2251]">Dashboard</h2>
        <div className="flex flex-col gap-6">
          <Link
            to="/activities"
            className="bg-white border rounded-lg shadow p-6 hover:bg-[#f5e6ea] text-[#fd3572] font-bold text-lg transition"
          >
            Daily Activities
          </Link>
          <Link
            to="/reports"
            className="bg-white border rounded-lg shadow p-6 hover:bg-[#f5e6ea] text-[#fd3572] font-bold text-lg transition"
          >
            Reports
          </Link>
        </div>
      </div>
    </div>
  );
}
