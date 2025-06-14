
import React, { useState, useEffect } from "react";
import MainNavbar from "@/components/MainNavbar";
import CountyHeader from "@/components/CountyHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

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
};

export default function Dashboard() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load activities from localStorage on component mount
  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      const stored = localStorage.getItem('activities');
      const allActivities = stored ? JSON.parse(stored) : [];
      
      // Show only recent 5 activities
      const recentActivities = allActivities
        .sort((a: Activity, b: Activity) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
        .slice(0, 5);
      
      setActivities(recentActivities);
      console.log('Loaded recent activities from localStorage for dashboard:', recentActivities);
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
  const getAllActivities = () => {
    const stored = localStorage.getItem('activities');
    return stored ? JSON.parse(stored) : [];
  };

  const allActivities = getAllActivities();
  const totalActivities = allActivities.length;
  const totalDuration = allActivities.reduce((sum: number, activity: Activity) => sum + (Number(activity.duration) || 0), 0);
  const averageDuration = totalActivities > 0 ? Math.round(totalDuration / totalActivities) : 0;

  // Get activity type distribution
  const typeDistribution = allActivities.reduce((acc: Record<string, number>, activity: Activity) => {
    acc[activity.type] = (acc[activity.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostCommonType = Object.entries(typeDistribution).reduce(
    (max, [type, count]) => (count as number) > max.count ? { type, count: count as number } : max,
    { type: 'None', count: 0 }
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <CountyHeader />
      <MainNavbar />
      
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-12">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#be2251] mb-2">Dashboard</h2>
          <p className="text-gray-600">Overview of your administrative activities</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#be2251]">{totalActivities}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#be2251]">{totalDuration} min</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#be2251]">{averageDuration} min</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Most Common</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-[#be2251]">{mostCommonType.type}</div>
              <div className="text-sm text-gray-500">({mostCommonType.count} activities)</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#be2251]">Recent Activities</CardTitle>
            <p className="text-sm text-gray-600">Your latest administrative activities</p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                <p>Loading recent activities...</p>
              </div>
            ) : activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-[#be2251]">{activity.title}</h4>
                      <span className="text-sm text-gray-500">{activity.date}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>Type: {activity.type}</span>
                      <span>Duration: {activity.duration} mins</span>
                      <span>Facility: {activity.facility}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No activities recorded yet.</p>
                <a href="/activities" className="mt-2 text-[#be2251] hover:underline">
                  Add your first activity
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
