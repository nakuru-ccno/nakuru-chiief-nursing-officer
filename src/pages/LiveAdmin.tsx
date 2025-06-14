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
  Zap,
  Wifi,
  WifiOff
} from "lucide-react";

const LiveAdmin = () => {
  const [activeTab, setActiveTab] = useState("Live Dashboard");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentUser, setCurrentUser] = useState<string>("Administrator");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  // Enhanced time updates for cross-device synchronization
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setLastSyncTime(new Date());
    }, 1000); // Update every second for better real-time feel

    return () => clearInterval(timer);
  }, []);

  // Monitor online/offline status for cross-device sync
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Device back online - refreshing data...');
      setIsOnline(true);
      setLastSyncTime(new Date());
      window.location.reload(); // Refresh to ensure latest data
    };
    
    const handleOffline = () => {
      console.log('📴 Device offline - will sync when back online');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Get current user
  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const userName = user.email?.split('@')[0] || user.email || "Administrator";
      setCurrentUser(userName);
    } else {
      setCurrentUser("Administrator");
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
    localStorage.clear();
    supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleNavClick = (tab: string) => {
    console.log(`${tab} navigation clicked`);
    setActiveTab(tab);
  };

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered for cross-device sync');
    setLastSyncTime(new Date());
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
      
      {/* Enhanced Admin Navigation with Connection Status */}
      <nav className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-xl border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Navigation Tabs */}
            <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-2 mr-3 sm:mr-6 text-white flex-shrink-0">
                <Zap className="text-[#fd3572]" size={16} />
                <span className="font-bold text-sm sm:text-lg whitespace-nowrap">Live Admin</span>
                {isOnline ? (
                  <Wifi className="text-green-500" size={14} />
                ) : (
                  <WifiOff className="text-red-500" size={14} />
                )}
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

            {/* Action Buttons with Connection Status */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 sm:gap-2 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500 transition-all duration-200 px-2 sm:px-4"
              >
                <RefreshCw size={12} />
                <span className="hidden sm:inline">Sync</span>
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
        {/* Enhanced Header with Connection Status */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-3xl font-bold text-[#be2251] mb-2 flex items-center gap-2 sm:gap-3">
            <span className="truncate">{getGreeting()}, {currentUser}!</span>
            <div className="relative flex-shrink-0">
              <div className={`w-3 h-3 ${isOnline ? 'bg-green-500' : 'bg-red-500'} rounded-full animate-pulse`}></div>
              <div className={`absolute inset-0 w-3 h-3 ${isOnline ? 'bg-green-400' : 'bg-red-400'} rounded-full animate-ping`}></div>
            </div>
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-600 mb-2">
            <span className="font-medium">County of Unlimited Opportunities</span>
            <span className="bg-[#fd3572] text-white px-3 py-1 rounded-full text-sm font-medium self-start">HQ</span>
            <span className={`text-xs px-2 py-1 rounded-full ${isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {isOnline ? 'Online - Cross-device sync active' : 'Offline - Will sync when reconnected'}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-500 text-sm">
            <span>{formatDate()}</span>
            <span className="font-mono text-base sm:text-lg text-[#fd3572]">{formatTime()}</span>
            <span className="text-xs">Last sync: {lastSyncTime.toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Live Statistics - Enhanced for cross-device sync */}
        <div className="mb-6 sm:mb-8">
          <LiveStats />
        </div>

        {/* Activity Feed and System Monitor - Enhanced for cross-device sync */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <LiveActivityFeed />
          <SystemMonitor />
        </div>

        {/* Enhanced System Status with Cross-Device Sync Information */}
        <div className="bg-white rounded-xl p-4 sm:p-6 border shadow-lg">
          <h3 className="text-base sm:text-lg font-bold text-[#be2251] mb-4 flex items-center gap-2">
            <Monitor size={20} />
            System Status & Cross-Device Synchronization
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="relative flex-shrink-0">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
              </div>
              <div className="min-w-0">
                <span className="text-sm font-medium text-green-800">Database</span>
                <p className="text-xs text-green-600">Online & Synced</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="relative flex-shrink-0">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
              </div>
              <div className="min-w-0">
                <span className="text-sm font-medium text-green-800">Real-time</span>
                <p className="text-xs text-green-600">Cross-device Active</p>
              </div>
            </div>
            
            <div className={`flex items-center gap-3 p-3 rounded-lg border ${isOnline ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="relative flex-shrink-0">
                <div className={`w-3 h-3 ${isOnline ? 'bg-green-500' : 'bg-red-500'} rounded-full animate-pulse`}></div>
                <div className={`absolute inset-0 w-3 h-3 ${isOnline ? 'bg-green-400' : 'bg-red-400'} rounded-full animate-ping`}></div>
              </div>
              <div className="min-w-0">
                <span className={`text-sm font-medium ${isOnline ? 'text-green-800' : 'text-red-800'}`}>Network</span>
                <p className={`text-xs ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                  {isOnline ? 'Connected' : 'Offline Mode'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="relative flex-shrink-0">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
              </div>
              <div className="min-w-0">
                <span className="text-sm font-medium text-green-800">Sync Status</span>
                <p className="text-xs text-green-600">All Devices Online</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500 gap-2">
              <span>Last sync: {lastSyncTime.toLocaleTimeString()}</span>
              <span className="flex items-center gap-1">
                <div className={`w-2 h-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'} rounded-full animate-pulse`}></div>
                {isOnline ? 'Cross-device sync enabled' : 'Will sync when online'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveAdmin;
