import React, { useState, useEffect } from "react";
import MainNavbar from "@/components/MainNavbar";
import CountyHeader from "@/components/CountyHeader";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Users, BarChart3, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LiveStats from "@/components/admin/LiveStats";
import LiveActivityFeed from "@/components/admin/LiveActivityFeed";
import UserPermissions from "@/components/admin/UserPermissions";
import DataManagement from "@/components/admin/DataManagement";
import SystemMonitor from "@/components/admin/SystemMonitor";
import DashboardSettings from "@/components/admin/DashboardSettings";
import { useActivitiesRealtime } from "@/hooks/useActivitiesRealtime";

type Activity = {
  id: string;
  date: string;
  facility: string;
  title: string;
  type: string;
  duration: number;
  description: string;
  submitted_by: string;
  submitted_at: string;
  created_at: string;
};

export default function Admin() {
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔧 Admin component mounted');
    getCurrentUser();
    fetchActivities();
  }, []);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        const displayName = user.user_metadata?.full_name || 
                           user.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 
                           "Admin";
        setCurrentUser(displayName);
        console.log('👤 Current admin user:', displayName);

        // Fetch user's role from profiles table
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('email', user.email)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          setUserRole('Administrator'); // Default role for admin
        } else if (profile) {
          setUserRole(profile.role || 'Administrator');
          // Use full name if available, otherwise use email prefix
          setCurrentUser(profile.full_name || displayName);
          console.log('Admin user role set:', profile.role);
        }
      } else {
        setCurrentUser("Admin");
        setUserRole("Administrator");
      }
    } catch (error) {
      console.error('❌ Error getting current user:', error);
      setCurrentUser("Admin");
      setUserRole("Administrator");
    }
  };

  const fetchActivities = useCallback(async () => {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (!error) setActivities(data ?? []);
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  useActivitiesRealtime(fetchActivities);

  const handleGenerateActivityReport = () => {
    console.log('📋 Generating Activity Report...');
    toast({
      title: "Generating Report",
      description: "Redirecting to detailed activity reports...",
    });
    navigate('/reports');
  };

  const handleGenerateUserReport = () => {
    console.log('👥 Generating User Report...');
    toast({
      title: "User Report",
      description: "User engagement report functionality coming soon...",
    });
    navigate('/reports');
  };

  const handleGenerateSystemReport = () => {
    console.log('⚙️ Generating System Report...');
    toast({
      title: "System Report", 
      description: "System performance report functionality coming soon...",
    });
    navigate('/reports');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 22) return "Good Evening";
    return "Good Night";
  };

  // Format the user display name with role
  const getUserDisplayName = () => {
    if (userRole && userRole !== 'User') {
      return `${currentUser}, ${userRole}`;
    }
    return currentUser;
  };

  const totalActivities = activities.length;
  const thisMonth = new Date();
  thisMonth.setDate(1);
  const thisMonthActivities = activities.filter(activity => {
    const activityDate = new Date(activity.created_at);
    return activityDate >= thisMonth;
  }).length;

  const totalHours = Math.floor(activities.reduce((sum, activity) => sum + (activity.duration || 0), 0) / 60);
  const uniqueUsers = new Set(activities.map(activity => activity.submitted_by).filter(Boolean)).size;

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4 sm:p-6">
                  <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-1">{totalActivities}</div>
                  <div className="text-xs sm:text-sm text-red-700 font-medium">Total Activities</div>
                  <div className="text-xs text-red-600">All time</div>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4 sm:p-6">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">{thisMonthActivities}</div>
                  <div className="text-xs sm:text-sm text-blue-700 font-medium">This Month</div>
                  <div className="text-xs text-blue-600">Current month</div>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4 sm:p-6">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">{totalHours}</div>
                  <div className="text-xs sm:text-sm text-green-700 font-medium">Total Hours</div>
                  <div className="text-xs text-green-600">Hours logged</div>
                </CardContent>
              </Card>

              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-4 sm:p-6">
                  <div className="text-2xl sm:text-3xl font-bold text-yellow-600 mb-1">{uniqueUsers}</div>
                  <div className="text-xs sm:text-sm text-yellow-700 font-medium">Contributors</div>
                  <div className="text-xs text-yellow-600">Unique users</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <FileText size={20} />
                    Activity Report
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Comprehensive activity tracking and analysis</p>
                  <Button 
                    onClick={handleGenerateActivityReport}
                    className="w-full bg-[#fd3572] hover:bg-[#be2251]"
                  >
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <Users size={20} />
                    User Report
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">User engagement and performance metrics</p>
                  <Button 
                    onClick={handleGenerateUserReport}
                    className="w-full bg-[#fd3572] hover:bg-[#be2251]"
                  >
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <BarChart3 size={20} />
                    System Report
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">System usage and performance statistics</p>
                  <Button 
                    onClick={handleGenerateSystemReport}
                    className="w-full bg-[#fd3572] hover:bg-[#be2251]"
                  >
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LiveStats />
              <LiveActivityFeed />
            </div>
          </>
        );
      case "users":
        return <UserPermissions />;
      case "data":
        return <DataManagement />;
      case "system":
        return <SystemMonitor />;
      case "settings":
        return <DashboardSettings />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CountyHeader />
        <MainNavbar />
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="text-center py-8 text-gray-500">
            <p>Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CountyHeader />
      <MainNavbar />
      
      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">{getGreeting()}, {getUserDisplayName()}!</h1>
          <p className="text-lg sm:text-xl mb-2">County of Unlimited Opportunities</p>
          <p className="text-sm sm:text-base opacity-90">🔧 Administrative Dashboard & Controls</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 -mt-6">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={activeTab === "overview" ? "default" : "outline"}
              onClick={() => setActiveTab("overview")}
              className={activeTab === "overview" ? "bg-[#fd3572] hover:bg-[#be2251]" : ""}
            >
              <BarChart3 size={16} className="mr-2" />
              Overview
            </Button>
            <Button
              variant={activeTab === "users" ? "default" : "outline"}
              onClick={() => setActiveTab("users")}
              className={activeTab === "users" ? "bg-[#fd3572] hover:bg-[#be2251]" : ""}
            >
              <Users size={16} className="mr-2" />
              Users
            </Button>
            <Button
              variant={activeTab === "data" ? "default" : "outline"}
              onClick={() => setActiveTab("data")}
              className={activeTab === "data" ? "bg-[#fd3572] hover:bg-[#be2251]" : ""}
            >
              <FileText size={16} className="mr-2" />
              Data
            </Button>
            <Button
              variant={activeTab === "system" ? "default" : "outline"}
              onClick={() => setActiveTab("system")}
              className={activeTab === "system" ? "bg-[#fd3572] hover:bg-[#be2251]" : ""}
            >
              <Settings size={16} className="mr-2" />
              System
            </Button>
            <Button
              variant={activeTab === "settings" ? "default" : "outline"}
              onClick={() => setActiveTab("settings")}
              className={activeTab === "settings" ? "bg-[#fd3572] hover:bg-[#be2251]" : ""}
            >
              <Settings size={16} className="mr-2" />
              Settings
            </Button>
          </div>

          {renderTabContent()}
        </div>
        
        <div className="text-sm italic text-gray-500 mt-6 text-center">
          Administrative dashboard with comprehensive system controls and monitoring.
        </div>
      </div>
    </div>
  );
}
