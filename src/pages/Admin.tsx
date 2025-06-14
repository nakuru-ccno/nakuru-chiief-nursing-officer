
import React from "react";
import MainNavbar from "@/components/MainNavbar";
import CountyHeader from "@/components/CountyHeader";
import { Link } from "react-router-dom";

const Admin = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <CountyHeader />
      <MainNavbar />
      <div className="max-w-2xl mx-auto pt-14 pb-24 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-[#be2251] mb-4">Admin Portal</h1>
        <p className="text-lg text-gray-700 mb-8 text-center">
          Welcome, <span className="text-[#fd3572] font-semibold">admin</span>! 
          <br />
          Use the tools below to access dashboards and site areas.
        </p>
        <div className="flex gap-5 flex-wrap mb-10">
          <Link
            to="/dashboard"
            className="bg-white border rounded-lg shadow px-6 py-3 font-bold text-[#fd3572] text-lg hover:bg-[#fbe8ee] transition"
          >
            Dashboard
          </Link>
          <Link
            to="/"
            className="bg-white border rounded-lg shadow px-6 py-3 font-bold text-[#be2251] text-lg hover:bg-[#fbe8ee] transition"
          >
            Home
          </Link>
        </div>
        <div className="text-sm text-gray-500">
          If this is not your role, please <span className="font-bold text-[#fd3572]">logout</span> and log in with the correct account.
        </div>
      </div>
    </div>
  );
};

export default Admin;
