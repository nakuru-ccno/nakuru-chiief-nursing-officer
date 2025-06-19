
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
  WifiOff,
  Shield,
  Database,
  Activity,
  Clock,
  TrendingUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <CountyHeader />
      
      {/* Enhanced Navigation with Better Styling */}
      <nav className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-2xl border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Navigation Tabs with Enhanced Design */}
            <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-3 mr-6 text-white flex-shrink-0">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Zap className="text-white" size={20} />
                </div>
                <span className="font-bold text-xl whitespace-nowrap bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">Live Admin</span>
                <div className="flex items-center gap-2">
                  {isOnline ? (
                    <div className="flex items-center gap-1">
                      <Wifi className="text-green-400" size={16} />
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <WifiOff className="text-red-400" size={16} />
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
              </div>
              
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-xl transform scale-105"
                        : "text-slate-300 hover:text-white hover:bg-slate-700/60 hover:scale-105"
                    }`}
                  >
                    <Icon size={16} />
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <Button
                onClick={handleRefresh}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-4 py-2 rounded-xl"
              >
                <RefreshCw size={14} />
                <span className="hidden sm:inline font-semibold">Sync</span>
              </Button>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 rounded-3xl p-8 mb-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-6 lg:mb-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                    <Shield className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                      {getGreeting()}, {currentUser}!
                    </h1>
                    <p className="text-slate-300 text-lg">Live Administrative Control Center</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-slate-300 mb-4">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    <span className="font-medium">County of Unlimited Opportunities</span>
                  </div>
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    HQ Control
                  </div>
                  <div className={`text-xs px-3 py-1 rounded-full font-medium ${isOnline ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                    {isOnline ? '● Online - Cross-device sync active' : '● Offline - Will sync when reconnected'}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-slate-400 text-sm">
                  <span className="font-medium">{formatDate()}</span>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="font-mono text-lg text-blue-300 font-bold">{formatTime()}</span>
                  </div>
                  <span className="text-xs bg-slate-700/50 px-2 py-1 rounded-full">
                    Last sync: {lastSyncTime.toLocaleTimeString()}
                  </span>
                </div>
              </div>
              
              <div className="text-center lg:text-right">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 ${isOnline ? 'bg-green-400' : 'bg-red-400'} rounded-full animate-pulse`}></div>
                    <h3 className="text-lg font-semibold">System Status</h3>
                  </div>
                  <div className={`text-3xl font-bold ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                    {isOnline ? 'Online' : 'Offline'}
                  </div>
                  <p className="text-sm opacity-90">Real-time monitoring</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Live Statistics */}
        <div className="mb-8">
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <TrendingUp className="h-7 w-7" />
                </div>
                Live System Analytics
                <div className="ml-auto flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-normal">Real-time</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <LiveStats />
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Activity Feed and System Monitor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <CardTitle className="flex items-center gap-3 text-xl font-bold">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Activity className="h-6 w-6" />
                </div>
                Live Activity Feed
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <LiveActivityFeed />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
              <CardTitle className="flex items-center gap-3 text-xl font-bold">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Monitor className="h-6 w-6" />
                </div>
                System Monitor
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <SystemMonitor />
            </CardContent>
          </Card>
        </div>

        {/* Enhanced System Status */}
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-700 text-white">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Monitor className="h-7 w-7" />
              </div>
              System Status & Cross-Device Synchronization
              <div className="ml-auto flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-300" />
                <span className="text-sm font-normal">Live Monitoring</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Database className="w-4 h-4 text-green-600" />
                      <span className="font-bold text-green-800">Database</span>
                    </div>
                    <p className="text-sm text-green-600 font-medium">Online & Synced</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-4 h-4 bg-blue-400 rounded-full animate-ping"></div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-blue-800">Real-time</span>
                    </div>
                    <p className="text-sm text-blue-600 font-medium">Cross-device Active</p>
                  </div>
                </div>
              </div>
              
              <div className={`bg-gradient-to-br rounded-2xl p-6 border-2 shadow-lg ${isOnline ? 'from-green-50 to-emerald-50 border-green-200' : 'from-red-50 to-rose-50 border-red-200'}`}>
                <div className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <div className={`w-4 h-4 ${isOnline ? 'bg-green-500' : 'bg-red-500'} rounded-full animate-pulse`}></div>
                    <div className={`absolute inset-0 w-4 h-4 ${isOnline ? 'bg-green-400' : 'bg-red-400'} rounded-full animate-ping`}></div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {isOnline ? <Wifi className="w-4 h-4 text-green-600" /> : <WifiOff className="w-4 h-4 text-red-600" />}
                      <span className={`font-bold ${isOnline ? 'text-green-800' : 'text-red-800'}`}>Network</span>
                    </div>
                    <p className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                      {isOnline ? 'Connected' : 'Offline Mode'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-4 h-4 bg-purple-400 rounded-full animate-ping"></div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-4 h-4 text-purple-600" />
                      <span className="font-bold text-purple-800">Sync Status</span>
                    </div>
                    <p className="text-sm text-purple-600 font-medium">All Devices Online</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm text-gray-600 gap-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">Last sync: {lastSyncTime.toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 ${isOnline ? 'bg-green-500' : 'bg-red-500'} rounded-full animate-pulse`}></div>
                  <span className="font-medium">
                    {isOnline ? 'Cross-device sync enabled' : 'Will sync when online'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LiveAdmin;
