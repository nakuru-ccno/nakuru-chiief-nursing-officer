
import React, { useState } from "react";
import CountyHeader from "@/components/CountyHeader";
import { Button } from "@/components/ui/button";
import LiveStats from "@/components/admin/LiveStats";
import LiveActivityFeed from "@/components/admin/LiveActivityFeed";
import SystemMonitor from "@/components/admin/SystemMonitor";
import { 
  Monitor, 
  Users, 
  BarChart3, 
  Settings, 
  RefreshCw, 
  LogOut,
  Zap
} from "lucide-react";

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

  const navItems = [
    { id: "Live Dashboard", label: "Live Dashboard", icon: Monitor },
    { id: "Users", label: "Users", icon: Users },
    { id: "Analytics", label: "Analytics", icon: BarChart3 },
    { id: "Settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <CountyHeader />
      
      {/* Modern Admin Navigation */}
      <nav className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-xl border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Navigation Tabs */}
            <div className="flex items-center space-x-1">
              <div className="flex items-center gap-2 mr-6 text-white">
                <Zap className="text-[#fd3572]" size={20} />
                <span className="font-bold text-lg">Live Admin</span>
              </div>
              
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-[#fd3572] to-[#be2251] text-white shadow-lg transform scale-105"
                        : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                    }`}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500 transition-all duration-200"
              >
                <RefreshCw size={14} />
                Refresh
              </Button>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#be2251] mb-2 flex items-center gap-3">
            Live System Administration Dashboard
            <div className="relative">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
            </div>
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

        {/* Enhanced Status Information */}
        <div className="bg-white rounded-xl p-6 border shadow-lg">
          <h3 className="text-lg font-bold text-[#be2251] mb-4 flex items-center gap-2">
            <Monitor size={20} />
            System Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="relative">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
              </div>
              <div>
                <span className="text-sm font-medium text-green-800">Database</span>
                <p className="text-xs text-green-600">Online & Optimized</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="relative">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
              </div>
              <div>
                <span className="text-sm font-medium text-green-800">API</span>
                <p className="text-xs text-green-600">Healthy & Responsive</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="relative">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
              </div>
              <div>
                <span className="text-sm font-medium text-green-800">Services</span>
                <p className="text-xs text-green-600">All Systems Running</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Auto-refresh enabled
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveAdmin;
