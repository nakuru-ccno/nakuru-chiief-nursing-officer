
import React, { useState } from "react";
import CountyHeader from "@/components/CountyHeader";
import { Button } from "@/components/ui/button";
import LiveStats from "@/components/admin/LiveStats";
import LiveActivityFeed from "@/components/admin/LiveActivityFeed";
import SystemMonitor from "@/components/admin/SystemMonitor";

const LiveAdmin = () => {
  const [activeTab, setActiveTab] = useState("Live Dashboard");

  const handleLogout = () => {
    console.log("Logout clicked");
    localStorage.removeItem("role");
    window.location.href = "/";
  };

  const handleNavClick = (tab: string) => {
    console.log(`${tab} navigation clicked`);
    setActiveTab(tab);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CountyHeader />
      
      {/* Custom Admin Navigation */}
      <nav className="w-full bg-[#111] flex items-center px-4 py-2 justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => handleNavClick("Live Dashboard")}
            className={`text-sm px-4 py-2 font-semibold rounded transition-all cursor-pointer ${
              activeTab === "Live Dashboard" 
                ? "bg-[#fd3572] text-white" 
                : "text-[#fd3572] hover:bg-[#251c21] hover:text-white"
            }`}
          >
            Live Dashboard
          </button>
          <button
            onClick={() => handleNavClick("Users")}
            className={`text-sm px-4 py-2 font-semibold rounded transition-all cursor-pointer ${
              activeTab === "Users" 
                ? "bg-[#fd3572] text-white" 
                : "text-[#fd3572] hover:bg-[#251c21] hover:text-white"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => handleNavClick("Analytics")}
            className={`text-sm px-4 py-2 font-semibold rounded transition-all cursor-pointer ${
              activeTab === "Analytics" 
                ? "bg-[#fd3572] text-white" 
                : "text-[#fd3572] hover:bg-[#251c21] hover:text-white"
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => handleNavClick("Settings")}
            className={`text-sm px-4 py-2 font-semibold rounded transition-all cursor-pointer ${
              activeTab === "Settings" 
                ? "bg-[#fd3572] text-white" 
                : "text-[#fd3572] hover:bg-[#251c21] hover:text-white"
            }`}
          >
            Settings
          </button>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="text-white border-[#fd3572] hover:bg-[#fd3572]"
          >
            Refresh
          </Button>
          <button
            onClick={handleLogout}
            className="text-xs px-4 py-2 rounded bg-[#be2251] text-white font-bold shadow hover:bg-[#fd3572] ml-2"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#be2251] mb-2 flex items-center gap-2">
            Live System Administration Dashboard
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </h1>
          <h2 className="text-xl text-gray-700 mb-1">Nakuru County - Real-time Monitoring</h2>
          <p className="text-sm text-gray-500 italic">County of Unlimited Opportunities</p>
        </div>

        {/* Live Statistics */}
        <div className="mb-8">
          <LiveStats />
        </div>

        {/* Activity Feed and System Monitor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <LiveActivityFeed />
          <SystemMonitor />
        </div>

        {/* Status Information */}
        <div className="bg-white rounded-lg p-6 border">
          <h3 className="text-lg font-bold text-[#be2251] mb-4">System Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm">Database: Online</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm">API: Healthy</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm">Services: Running</span>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Last updated: {new Date().toLocaleTimeString()} • Auto-refresh enabled
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveAdmin;
