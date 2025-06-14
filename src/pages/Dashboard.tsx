
import React, { useState, useEffect } from "react";
import MainNavbar from "@/components/MainNavbar";
import CountyHeader from "@/components/CountyHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

export default function Dashboard() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [allActivities, setAllActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string>("");
  const { toast } = useToast();

  // Load activities from Supabase on component mount
  useEffect(() => {
    fetchActivities();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUser(user.email || "User");
    }
  };

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching activities:', error);
        toast({
          title: "Error",
          description: "Failed to load activities from database",
          variant: "destructive",
        });
        return;
      }

      console.log('Loaded activities from Supabase for dashboard:', data);
      
      // Store all activities for statistics
      setAllActivities((data as Activity[]) || []);
      
      // Show only recent 5 activities for the dashboard
      const recentActivities = ((data as Activity[]) || []).slice(0, 5);
      setActivities(recentActivities);
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
  };

  // Calculate statistics from all activities
  const totalActivities = allActivities.length;
  const thisMonth = new Date();
  thisMonth.setDate(1);
  const thisMonthActivities = allActivities.filter(activity => {
    const activityDate = new Date(activity.created_at);
    return activityDate >= thisMonth;
  }).length;

  const totalHours = Math.floor(allActivities.reduce((sum, activity) => sum + (activity.duration || 0), 0) / 60);
  const averageMinutes = totalActivities > 0 ? Math.round(allActivities.reduce((sum, activity) => sum + (activity.duration || 0), 0) / totalActivities) : 0;

  // Get activity type distribution
  const typeDistribution = allActivities.reduce((acc: Record<string, number>, activity: Activity) => {
    acc[activity.type] = (acc[activity.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostCommonType = Object.entries(typeDistribution).reduce(
    (max, [type, count]) => (count as number) > max.count ? { type, count: count as number } : max,
    { type: 'None', count: 0 }
  );

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 22) return "Good Evening";
    return "Good Night";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CountyHeader />
        <MainNavbar />
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="text-center py-8 text-gray-500">
            <p>Loading activities from database...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CountyHeader />
      <MainNavbar />
      
      {/* Hero Section with Gradient */}
      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">{getGreeting()}, {currentUser}!</h1>
          <p className="text-lg sm:text-xl mb-2">County of Unlimited Opportunities</p>
          <p className="text-sm sm:text-base opacity-90">📍 HQ</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 -mt-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4 sm:p-6">
              <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-1">{totalActivities}</div>
              <div className="text-xs sm:text-sm text-red-700 font-medium">Total Activities</div>
              <div className="text-xs text-red-600">All time activities</div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 sm:p-6">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">{thisMonthActivities}</div>
              <div className="text-xs sm:text-sm text-blue-700 font-medium">This Month</div>
              <div className="text-xs text-blue-600">Activities this month</div>
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
              <div className="text-2xl sm:text-3xl font-bold text-yellow-600 mb-1">{averageMinutes}</div>
              <div className="text-xs sm:text-sm text-yellow-700 font-medium">Average</div>
              <div className="text-xs text-yellow-600">Minutes per activity</div>
            </CardContent>
          </Card>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-green-700">Activity Overview</CardTitle>
              <p className="text-sm text-gray-600">Your activity summary and insights</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Most Common Activity Type</span>
                  <Badge className={`${getTypeColor(mostCommonType.type)} text-xs`}>
                    {mostCommonType.type} ({mostCommonType.count})
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Average Duration</span>
                  <span className="text-sm text-gray-600">{averageMinutes} minutes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Time Logged</span>
                  <span className="text-sm text-gray-600">{totalHours} hours</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-green-700">Quick Actions</CardTitle>
              <p className="text-sm text-gray-600">Manage your activities and reports</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <a
                href="/activities"
                className="w-full bg-[#fd3572] text-white font-bold px-4 py-3 rounded shadow hover:bg-[#be2251] transition text-sm block text-center"
              >
                Add New Activity
              </a>
              <a
                href="/reports"
                className="w-full bg-black text-white font-bold px-4 py-3 rounded shadow hover:bg-gray-800 transition text-sm block text-center"
              >
                View Reports
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-green-700">Recent Activities</CardTitle>
            <p className="text-sm text-gray-600">Your latest recorded activities</p>
          </CardHeader>
          <CardContent>
            {activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="border-l-4 border-l-blue-500 pl-4 py-3 bg-gray-50 rounded-r">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-gray-900 uppercase tracking-wide">
                          {activity.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{activity.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={`${getTypeColor(activity.type)} text-xs`}>
                            {activity.type}
                          </Badge>
                          <span className="text-xs text-gray-500">{activity.duration} min</span>
                          <span className="text-xs text-gray-500">by {activity.submitted_by || 'Unknown User'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No activities recorded yet.</p>
                <a href="/activities" className="mt-2 text-[#be2251] hover:underline text-sm">
                  Add your first activity
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-sm italic text-gray-500 mt-6 text-center">
          All submitted activities are synced across devices and visible here. Add activities to track your work.
        </div>
      </div>
    </div>
  );
}
