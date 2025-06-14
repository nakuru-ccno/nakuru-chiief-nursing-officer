
import React, { useState, useEffect } from "react";
import MainNavbar from "@/components/MainNavbar";
import CountyHeader from "@/components/CountyHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Calendar, Clock, Activity, FileText, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ActivityData {
  id: string;
  title: string;
  type: string;
  submitted_by: string;
  created_at: string;
  duration?: number;
}

const Dashboard = () => {
  const [currentUser, setCurrentUser] = useState<string>("User");
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");
  const [stats, setStats] = useState({
    totalActivities: 0,
    thisMonth: 0,
    totalHours: 0,
    averageMinutes: 0
  });
  const [recentActivities, setRecentActivities] = useState<ActivityData[]>([]);
  const { toast } = useToast();

  // Get current user
  useEffect(() => {
    getCurrentUser();
  }, []);

  // Fetch user-specific data
  useEffect(() => {
    if (currentUserEmail) {
      fetchUserStats();
      fetchRecentActivities();
    }
  }, [currentUserEmail]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      setCurrentUserEmail(user.email);
      const displayName = user.user_metadata?.full_name || 
                         user.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 
                         "User";
      setCurrentUser(displayName);
    } else {
      setCurrentUser("User");
      setCurrentUserEmail("");
    }
  };

  const fetchUserStats = async () => {
    try {
      if (!currentUserEmail) return;

      const { data: activities, error } = await supabase
        .from('activities')
        .select('*')
        .eq('submitted_by', currentUserEmail);

      if (error) {
        console.error('Error fetching user activities:', error);
        return;
      }

      const totalActivities = activities?.length || 0;
      
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const thisMonthActivities = activities?.filter((activity: ActivityData) => {
        const activityDate = new Date(activity.created_at);
        return activityDate >= oneMonthAgo;
      }) || [];

      const totalMinutes = activities?.reduce((sum: number, activity: ActivityData) => 
        sum + (activity.duration || 0), 0) || 0;
      const totalHours = Math.floor(totalMinutes / 60);
      const averageMinutes = totalActivities > 0 ? Math.round(totalMinutes / totalActivities) : 0;

      setStats({
        totalActivities,
        thisMonth: thisMonthActivities.length,
        totalHours,
        averageMinutes
      });

    } catch (error) {
      console.error('Error fetching user stats:', error);
      setStats({
        totalActivities: 0,
        thisMonth: 0,
        totalHours: 0,
        averageMinutes: 0
      });
    }
  };

  const fetchRecentActivities = async () => {
    try {
      if (!currentUserEmail) return;

      const { data: activities, error } = await supabase
        .from('activities')
        .select('*')
        .eq('submitted_by', currentUserEmail)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching recent activities:', error);
        setRecentActivities([]);
        return;
      }

      setRecentActivities(activities || []);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      setRecentActivities([]);
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="home" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-8">
            {/* User Dashboard Header */}
            <div className="bg-gradient-to-r from-[#be2251] via-[#fd3572] to-[#be2251] text-white rounded-lg">
              <div className="px-6 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">
                      {getGreeting()}, {currentUser}!
                    </h1>
                    <p className="text-white/90">County of Unlimited Opportunities</p>
                    <p className="text-white/80 text-sm mt-1">HQ</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                  <CardTitle className="text-sm font-medium">This Month</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.thisMonth}</div>
                  <p className="text-xs text-muted-foreground">Activities this month</p>
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

              <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{stats.averageMinutes}</div>
                  <p className="text-xs text-muted-foreground">Minutes per activity</p>
                </CardContent>
              </Card>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#be2251]">
                    <Plus className="h-5 w-5" />
                    Add New Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">Record your daily administrative tasks</p>
                  <Button 
                    className="w-full bg-[#be2251] hover:bg-[#fd3572]"
                    onClick={() => window.location.href = '/activities'}
                  >
                    Create Activity
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#be2251]">
                    <Eye className="h-5 w-5" />
                    View Activities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">Browse and manage all your activities</p>
                  <Button 
                    variant="outline" 
                    className="w-full border-[#be2251] text-[#be2251] hover:bg-[#be2251] hover:text-white"
                    onClick={() => window.location.href = '/activities'}
                  >
                    View All ({stats.totalActivities})
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#be2251]">
                    <FileText className="h-5 w-5" />
                    Generate Reports
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">Export and analyze your activity data</p>
                  <Button 
                    variant="outline" 
                    className="w-full border-[#be2251] text-[#be2251] hover:bg-[#be2251] hover:text-white"
                    onClick={() => window.location.href = '/reports'}
                  >
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activities" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#be2251]">Your Activities</h2>
              <Button 
                className="bg-[#be2251] hover:bg-[#fd3572]"
                onClick={() => window.location.href = '/activities'}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Activity
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
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
                    <Activity className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-lg font-medium">No activities yet</p>
                    <p className="text-sm">Start by adding your first activity!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#be2251]">Reports</h2>
              <Button 
                className="bg-[#be2251] hover:bg-[#fd3572]"
                onClick={() => window.location.href = '/reports'}
              >
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>This Month:</span>
                      <span className="font-semibold">{stats.thisMonth} activities</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Hours:</span>
                      <span className="font-semibold">{stats.totalHours} hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span>All Time:</span>
                      <span className="font-semibold">{stats.totalActivities} activities</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Duration:</span>
                      <span className="font-semibold">{stats.averageMinutes} minutes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full bg-[#be2251] hover:bg-[#fd3572]"
                    onClick={() => window.location.href = '/reports'}
                  >
                    View Detailed Reports
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.location.href = '/activities'}
                  >
                    Export Activities
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
