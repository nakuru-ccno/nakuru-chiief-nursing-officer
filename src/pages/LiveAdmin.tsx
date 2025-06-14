
import React, { useState, useEffect } from "react";
import CountyHeader from "@/components/CountyHeader";
import { Button } from "@/components/ui/button";
import LiveStats from "@/components/admin/LiveStats";
import LiveActivityFeed from "@/components/admin/LiveActivityFeed";
import SystemMonitor from "@/components/admin/SystemMonitor";
import { supabase } from "@/integrations/supabase/client";
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
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentUser, setCurrentUser] = useState<string>("Administrator");

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Get current user
  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Extract name from email (part before @) or use full email
      const userName = user.email?.split('@')[0] || user.email || "Administrator";
      setCurrentUser(userName);
    } else {
      // Fallback to demo role if no Supabase user
      const demoRole = localStorage.getItem("role");
      if (demoRole) {
        setCurrentUser(demoRole === "admin" ? "Administrator" : "User");
      } else {
        setCurrentUser("Administrator");
      }
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 22) return "Good Evening";
    return "Good Night";
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
      
      {/* Modern Admin Navigation - Mobile Optimized */}
      <nav className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-xl border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Navigation Tabs */}
            <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-2 mr-3 sm:mr-6 text-white flex-shrink-0">
                <Zap className="text-[#fd3572]" size={16} />
                <span className="font-bold text-sm sm:text-lg whitespace-nowrap">Live Admin</span>
              </div>
              
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                      isActive
                        ? "bg-gradient-to-r from-[#fd3572] to-[#be2251] text-white shadow-lg transform scale-105"
                        : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                    }`}
                  >
                    <Icon size={14} />
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 sm:gap-2 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500 transition-all duration-200 px-2 sm:px-4"
              >
                <RefreshCw size={12} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-3 sm:p-6">
        {/* Header Section - Mobile Optimized */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-3xl font-bold text-[#be2251] mb-2 flex items-center gap-2 sm:gap-3">
            <span className="truncate">{getGreeting()}, {currentUser}!</span>
            <div className="relative flex-shrink-0">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
            </div>
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-600 mb-2">
            <span className="font-medium">County of Unlimited Opportunities</span>
            <span className="bg-[#fd3572] text-white px-3 py-1 rounded-full text-sm font-medium self-start">HQ</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-500 text-sm">
            <span>{formatDate()}</span>
            <span className="font-mono text-base sm:text-lg text-[#fd3572]">{formatTime()}</span>
          </div>
        </div>

        {/* Live Statistics - Mobile Optimized */}
        <div className="mb-6 sm:mb-8">
          <LiveStats />
        </div>

        {/* Activity Feed and System Monitor - Mobile Optimized */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <LiveActivityFeed />
          <SystemMonitor />
        </div>

        {/* Enhanced Status Information - Mobile Optimized */}
        <div className="bg-white rounded-xl p-4 sm:p-6 border shadow-lg">
          <h3 className="text-base sm:text-lg font-bold text-[#be2251] mb-4 flex items-center gap-2">
            <Monitor size={20} />
            System Status
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="relative flex-shrink-0">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
              </div>
              <div className="min-w-0">
                <span className="text-sm font-medium text-green-800">Database</span>
                <p className="text-xs text-green-600">Online & Optimized</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="relative flex-shrink-0">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
              </div>
              <div className="min-w-0">
                <span className="text-sm font-medium text-green-800">API</span>
                <p className="text-xs text-green-600">Healthy & Responsive</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="relative flex-shrink-0">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
              </div>
              <div className="min-w-0">
                <span className="text-sm font-medium text-green-800">Services</span>
                <p className="text-xs text-green-600">All Systems Running</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500 gap-2">
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
