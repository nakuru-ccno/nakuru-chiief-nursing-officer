
import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import MainNavbar from "@/components/MainNavbar";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { useLiveTime } from "@/hooks/useLiveTime";
import {
  Monitor,
  Users,
  BarChart3,
  Settings,
  RefreshCw,
  LogOut,
  Shield,
  Database,
  Activity,
  TrendingUp,
  Clock,
  Award,
  Zap
} from "lucide-react";
import UserPermissions from "@/components/admin/UserPermissions";
import LiveStats from "@/components/admin/LiveStats";

const Admin = () => {
  const [userData, setUserData] = useState<{
    email: string;
    full_name: string;
    role: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { currentTime, greeting } = useLiveTime();

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error("Error fetching user:", error);
        setError(error.message || "Failed to fetch user data.");
        return;
      }

      if (data?.user) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", data.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          setError(
            profileError.message || "Failed to fetch user profile data."
          );
          return;
        }

        setUserData({
          email: data.user.email || "",
          full_name: profile?.full_name || "",
          role: profile?.role || "",
        });
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem("sb-access-token");
      localStorage.removeItem("sb-refresh-token");
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
      toast({
        title: "Error",
        description: "Failed to logout",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <MainNavbar />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        
        {/* Enhanced Admin Header */}
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
                      {greeting}, Administrator
                    </h1>
                    <p className="text-slate-300 text-lg">{userData?.full_name || userData?.email || "System Admin"}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 text-sm opacity-90 mb-4">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    <span>System Control Center</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="font-mono">
                      {currentTime.toLocaleTimeString([], { 
                        hour: "2-digit", 
                        minute: "2-digit", 
                        second: "2-digit",
                        hour12: true 
                      })}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-center lg:text-right">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-5 h-5 text-green-400" />
                    <h3 className="text-lg font-semibold">System Status</h3>
                  </div>
                  <div className="text-3xl font-bold text-green-400">Online</div>
                  <p className="text-sm opacity-90">All systems operational</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">Administrative dashboard - Real-time monitoring</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Dashboard Content */}
        <div className="space-y-8">
          {/* Live Statistics - Enhanced */}
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <BarChart3 className="h-7 w-7" />
                </div>
                Live System Statistics
                <div className="ml-auto flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-normal">Real-time</span>
                </div>
              </CardTitle>
              <CardDescription className="text-blue-100">
                Real-time overview of system activities and user engagement
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <LiveStats />
            </CardContent>
          </Card>

          {/* User Management Section - Enhanced */}
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Users className="h-7 w-7" />
                </div>
                User Management & Permissions
                <div className="ml-auto">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                    <span className="text-sm font-semibold">Admin Panel</span>
                  </div>
                </div>
              </CardTitle>
              <CardDescription className="text-purple-100">
                Manage user accounts, roles, and system permissions with advanced controls
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <UserPermissions />
            </CardContent>
          </Card>

          {/* System Controls - Enhanced */}
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Settings className="h-7 w-7" />
                </div>
                System Administration
                <div className="ml-auto flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-300" />
                  <span className="text-sm font-normal">Quick Actions</span>
                </div>
              </CardTitle>
              <CardDescription className="text-emerald-100">
                Administrative controls and system settings for optimal performance
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="group">
                  <Button 
                    className="w-full h-auto p-6 bg-gradient-to-br from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    onClick={() => window.location.reload()}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <RefreshCw className="h-6 w-6" />
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg">Refresh Dashboard</div>
                        <div className="text-blue-100 text-sm">Update all data</div>
                      </div>
                    </div>
                  </Button>
                </div>
                
                <div className="group">
                  <Button 
                    className="w-full h-auto p-6 bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    onClick={() => toast({
                      title: "System Status",
                      description: "All systems operational",
                    })}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <Monitor className="h-6 w-6" />
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg">System Status</div>
                        <div className="text-emerald-100 text-sm">Check health</div>
                      </div>
                    </div>
                  </Button>
                </div>

                <div className="group">
                  <Button 
                    className="w-full h-auto p-6 bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    onClick={handleLogout}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <LogOut className="h-6 w-6" />
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg">Admin Logout</div>
                        <div className="text-red-100 text-sm">Secure exit</div>
                      </div>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Additional System Info */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Database className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-blue-900">Database</div>
                      <div className="text-blue-600 text-sm">Connected</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500 rounded-lg">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-emerald-900">Users</div>
                      <div className="text-emerald-600 text-sm">Active</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <Activity className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-purple-900">Activity</div>
                      <div className="text-purple-600 text-sm">Monitoring</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500 rounded-lg">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-amber-900">Security</div>
                      <div className="text-amber-600 text-sm">Protected</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;
