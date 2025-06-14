
import React, { useState, useEffect } from "react";
import MainNavbar from "@/components/MainNavbar";
import CountyHeader from "@/components/CountyHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Calendar, Clock, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Activity {
  id: string;
  title: string;
  type: string;
  submitted_by: string;
  created_at: string;
  duration?: number;
}

const Dashboard = () => {
  const [currentUser, setCurrentUser] = useState<string>("User");
  const [stats, setStats] = useState({
    totalActivities: 0,
    thisWeek: 0,
    totalHours: 0
  });
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

  // Get current user
  useEffect(() => {
    getCurrentUser();
  }, []);

  // Fetch user-specific data
  useEffect(() => {
    if (currentUser !== "User") {
      fetchUserStats();
      fetchRecentActivities();
    }
  }, [currentUser]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Extract name from email (part before @) or use full email
      const userName = user.email?.split('@')[0] || user.email || "User";
      setCurrentUser(userName);
    } else {
      setCurrentUser("User");
    }
  };

  const fetchUserStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all activities for current user
      const { data: activities, error } = await supabase
        .from('activities')
        .select('*')
        .eq('submitted_by', user.email);

      if (error) {
        console.error('Error fetching user activities:', error);
        return;
      }

      const totalActivities = activities?.length || 0;
      
      // Get this week's activities
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const thisWeekActivities = activities?.filter((activity: Activity) => {
        const activityDate = new Date(activity.created_at);
        return activityDate >= oneWeekAgo;
      }) || [];

      // Calculate total hours
      const totalMinutes = activities?.reduce((sum: number, activity: Activity) => 
        sum + (activity.duration || 0), 0) || 0;
      const totalHours = Math.floor(totalMinutes / 60);

      setStats({
        totalActivities,
        thisWeek: thisWeekActivities.length,
        totalHours
      });

    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: activities, error } = await supabase
        .from('activities')
        .select('*')
        .eq('submitted_by', user.email)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching recent activities:', error);
        return;
      }

      setRecentActivities(activities || []);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 22) return "Good Evening";
    return "Good Night";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeColor = (type: string) => {
    const lowerType = type.toLowerCase();
    switch (lowerType) {
      case 'administrative': return 'bg-purple-100 text-purple-800';
      case 'meetings': return 'bg-blue-100 text-blue-800';
      case 'training': return 'bg-green-100 text-green-800';
      case 'documentation': return 'bg-yellow-100 text-yellow-800';
      case 'supervision': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CountyHeader />
      <MainNavbar />
      
      {/* Modern Header Section */}
      <div className="bg-gradient-to-r from-[#be2251] via-[#fd3572] to-[#be2251] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {getGreeting()}, {currentUser}!
              </h1>
              <p className="text-white/90">Welcome to your nursing activity dashboard</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button 
                className="bg-white text-[#be2251] hover:bg-gray-100 font-semibold"
                onClick={() => window.location.href = '/activities'}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Activity
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 border-l-[#fd3572]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#be2251]">{stats.totalActivities}</div>
              <p className="text-xs text-muted-foreground">All time activities</p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.thisWeek}</div>
              <p className="text-xs text-muted-foreground">Activities completed</p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalHours}</div>
              <p className="text-xs text-muted-foreground">Hours logged</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#be2251] flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{activity.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(activity.type)}`}>
                          {activity.type}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(activity.created_at)}
                        </span>
                        {activity.duration && (
                          <span className="text-sm text-gray-500">
                            • {activity.duration} min
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p className="text-lg font-medium">No activities yet</p>
                <p className="text-sm">Start by adding your first activity!</p>
                <Button 
                  className="mt-4 bg-[#be2251] hover:bg-[#fd3572]"
                  onClick={() => window.location.href = '/activities'}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Activity
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
