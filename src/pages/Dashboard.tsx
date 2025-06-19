
import React, { useState, useEffect, useCallback } from "react";
import CountyHeader from "@/components/CountyHeader";
import MainNavbar from "@/components/MainNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, User, Plus, BarChart3, FileText, Users, TrendingUp, Activity, Target, Award, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLiveTime } from "@/hooks/useLiveTime";

interface ActivityData {
  id: string;
  title: string;
  type: string;
  date: string;
  duration: number;
  facility: string;
  description: string;
  submitted_by: string;
  created_at: string;
}

const Dashboard = () => {
  const { toast } = useToast();
  const { currentTime, greeting } = useLiveTime();
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<{
    email: string;
    full_name: string;
    role: string;
  } | null>(null);

  // Get current user data
  const fetchUserData = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error("Error fetching user:", error);
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
    }
  }, []);

  // Fetch activities - RLS policies will automatically filter based on user permissions
  const fetchActivities = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Dashboard - Fetching user activities (RLS will filter automatically)');
      
      // Get current user to determine admin status
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser?.user) {
        console.log('❌ No authenticated user found');
        setActivities([]);
        return;
      }

      // RLS policies will automatically filter results:
      // - Regular users will only see activities where submitted_by = their email
      // - Admins will see all activities
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching activities:', error);
        toast({
          title: "Error",
          description: "Failed to load activities",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Dashboard - Activities loaded (filtered by RLS):', data?.length || 0);
      setActivities(data || []);

    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        title: "Error",
        description: "Failed to load activities",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUserData();
    fetchActivities();
  }, [fetchUserData, fetchActivities]);

  // Real-time subscription for activities
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-activities')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities'
        },
        () => {
          console.log('🔄 Real-time update - refreshing activities');
          fetchActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchActivities]);

  const getTypeColor = (type: string) => {
    const colors = {
      'meetings': 'bg-red-100 text-red-800',
      'administrative': 'bg-pink-100 text-pink-800',
      'training': 'bg-green-100 text-green-800',
      'documentation': 'bg-yellow-100 text-yellow-800',
      'supervision': 'bg-purple-100 text-purple-800',
      'general': 'bg-gray-100 text-gray-800'
    };
    return colors[type.toLowerCase() as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Calculate user-specific statistics (RLS ensures these are filtered properly)
  const totalActivities = activities.length;
  const thisMonth = new Date();
  thisMonth.setDate(1);
  const thisMonthActivities = activities.filter(activity => {
    const activityDate = new Date(activity.created_at);
    return activityDate >= thisMonth;
  }).length;
  const totalHours = Math.floor(activities.reduce((sum, activity) => sum + (activity.duration || 0), 0) / 60);
  const averageDuration = totalActivities > 0 ? Math.round(activities.reduce((sum, activity) => sum + (activity.duration || 0), 0) / totalActivities) : 0;

  const isAdmin = userData?.role === 'admin' || userData?.role === 'System Administrator';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CountyHeader />
        <MainNavbar />
        <div className="max-w-7xl mx-auto p-8">
          <div className="text-center py-8 text-gray-500">
            <div className="w-8 h-8 border-4 border-[#fd3572] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <CountyHeader />
      <MainNavbar />
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 rounded-3xl p-8 mb-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-6 lg:mb-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gradient-to-r from-pink-500 to-red-600 rounded-2xl shadow-lg">
                    <Activity className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                      {greeting}
                    </h1>
                    <p className="text-slate-300 text-lg">{userData?.full_name || userData?.email || "Welcome back"}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 text-sm opacity-90 mb-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{isAdmin ? 'Administrator Dashboard' : 'Personal Dashboard'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="font-mono">
                      {currentTime.toLocaleTimeString([], { 
                        hour: "2-digit", 
                        minute: "2-digit", 
                        hour12: true 
                      })}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-center lg:text-right">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-green-400" />
                    <h3 className="text-lg font-semibold">My Activities</h3>
                  </div>
                  <div className="text-3xl font-bold text-green-400">{totalActivities}</div>
                  <p className="text-sm opacity-90">Activities logged</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">
                  {isAdmin ? 'Administrative view - All data visible' : 'Personal view - Your data only'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm border-l-4 border-l-pink-500 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">My Activities</p>
                  <p className="text-3xl font-bold text-pink-600">{totalActivities}</p>
                  <p className="text-xs text-gray-500">Total recorded</p>
                </div>
                <div className="p-3 bg-pink-100 rounded-xl">
                  <FileText className="h-8 w-8 text-pink-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm border-l-4 border-l-blue-500 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">This Month</p>
                  <p className="text-3xl font-bold text-blue-600">{thisMonthActivities}</p>
                  <p className="text-xs text-gray-500">Monthly progress</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm border-l-4 border-l-green-500 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Hours</p>
                  <p className="text-3xl font-bold text-green-600">{totalHours}</p>
                  <p className="text-xs text-gray-500">Time invested</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm border-l-4 border-l-purple-500 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Average Duration</p>
                  <p className="text-3xl font-bold text-purple-600">{averageDuration}</p>
                  <p className="text-xs text-gray-500">Minutes per activity</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden group hover:shadow-3xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-pink-500 to-red-600 text-white">
              <CardTitle className="flex items-center gap-3 text-xl font-bold">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                  <Plus className="h-6 w-6" />
                </div>
                Quick Add Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-600 mb-4">Record your daily activities and track your progress efficiently.</p>
              <Button 
                onClick={() => window.location.href = '/activities'}
                className="w-full bg-gradient-to-r from-pink-500 to-red-600 hover:from-pink-600 hover:to-red-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Add New Activity
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden group hover:shadow-3xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardTitle className="flex items-center gap-3 text-xl font-bold">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-6 w-6" />
                </div>
                View Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-600 mb-4">Analyze your activity patterns and generate comprehensive reports.</p>
              <Button 
                onClick={() => window.location.href = '/reports'}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                View My Reports
              </Button>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden group hover:shadow-3xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <CardTitle className="flex items-center gap-3 text-xl font-bold">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-6 w-6" />
                  </div>
                  Admin Panel
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4">Access administrative functions and manage system-wide data.</p>
                <Button 
                  onClick={() => window.location.href = '/admin'}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Open Admin Panel
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Activities */}
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-700 text-white">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Activity className="h-7 w-7" />
              </div>
              My Recent Activities
              <div className="ml-auto flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-normal">Live Updates</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {activities.length > 0 ? (
              <div className="space-y-4">
                {activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="bg-white border rounded-xl p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-gray-200 hover:border-l-pink-500">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-bold text-lg text-gray-900">{activity.title}</h3>
                          <Badge className={`${getTypeColor(activity.type)} text-xs`}>
                            {activity.type}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          {activity.description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(activity.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {activity.duration} minutes
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {activity.facility}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {activity.submitted_by}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {activities.length > 5 && (
                  <div className="text-center py-6 border-t">
                    <p className="text-gray-500 mb-4">
                      Showing 5 of {activities.length} activities
                    </p>
                    <Button 
                      onClick={() => window.location.href = '/activities'}
                      variant="outline"
                      className="border-pink-300 text-pink-600 hover:bg-pink-50"
                    >
                      View All My Activities
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No activities yet</h3>
                <p className="text-gray-500 mb-6">Start tracking your daily activities to see them here</p>
                <Button 
                  onClick={() => window.location.href = '/activities'}
                  className="bg-gradient-to-r from-pink-500 to-red-600 hover:from-pink-600 hover:to-red-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Activity
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
