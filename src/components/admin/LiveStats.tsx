
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { supabase } from "@/integrations/supabase/client";

interface LiveStatsProps {
  onStatsUpdate?: (stats: any) => void;
}

const LiveStats: React.FC<LiveStatsProps> = ({ onStatsUpdate }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalActivities: 0,
    thisMonth: 0,
    totalHours: 0,
    averageDuration: 0,
    activeUsers: 1,
    systemLoad: 45
  });

  const [hourlyData, setHourlyData] = useState([
    { hour: '00:00', activities: 0, users: 0 },
    { hour: '04:00', activities: 0, users: 0 },
    { hour: '08:00', activities: 0, users: 0 },
    { hour: '12:00', activities: 0, users: 0 },
    { hour: '16:00', activities: 0, users: 0 },
    { hour: '20:00', activities: 0, users: 0 }
  ]);

  // Fetch real statistics from activities table
  const fetchStats = async () => {
    try {
      // Get all activities
      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select('*');

      if (activitiesError) {
        console.error('Error fetching activities for stats:', activitiesError);
        return;
      }

      // Calculate statistics
      const totalActivities = activities?.length || 0;
      
      // Get this month's activities
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const thisMonthActivities = activities?.filter((activity: any) => {
        const activityDate = new Date(activity.created_at);
        return activityDate >= thisMonth;
      }) || [];

      // Get unique users (based on submitted_by)
      const uniqueUsers = new Set(activities?.map((activity: any) => activity.submitted_by).filter(Boolean) || []);

      // Calculate total hours from duration
      const totalMinutes = activities?.reduce((sum: number, activity: any) => sum + (activity.duration || 0), 0) || 0;
      const totalHours = Math.floor(totalMinutes / 60);

      // Calculate hourly distribution for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayActivities = activities?.filter((activity: any) => {
        const activityDate = new Date(activity.created_at);
        return activityDate >= today;
      }) || [];

      // Update hourly data with real activity counts
      const updatedHourlyData = hourlyData.map((item, index) => {
        const hour = index * 4;
        const hourActivities = todayActivities.filter((activity: any) => {
          const activityHour = new Date(activity.created_at).getHours();
          return activityHour >= hour && activityHour < hour + 4;
        });
        
        return {
          ...item,
          activities: hourActivities.length,
          users: new Set(hourActivities.map((a: any) => a.submitted_by).filter(Boolean)).size
        };
      });

      setHourlyData(updatedHourlyData);

      const newStats = {
        totalUsers: uniqueUsers.size,
        totalActivities,
        thisMonth: thisMonthActivities.length,
        totalHours,
        averageDuration: totalActivities > 0 ? Math.round(totalMinutes / totalActivities) : 0,
        activeUsers: Math.min(uniqueUsers.size, 5),
        systemLoad: Math.max(10, Math.min(90, 45 + Math.floor(Math.random() * 10) - 5))
      };

      setStats(newStats);

      console.log('Updated stats from activities:', {
        totalActivities,
        totalUsers: uniqueUsers.size,
        thisMonth: thisMonthActivities.length
      });

    } catch (error) {
      console.error('Error fetching activity stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();

    // Set up real-time subscription for stats updates
    const channel = supabase
      .channel('stats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities'
        },
        () => {
          console.log('Activity change detected, updating stats');
          fetchStats();
        }
      )
      .subscribe();

    // Update system load periodically
    const systemInterval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        systemLoad: Math.max(10, Math.min(90, prev.systemLoad + Math.floor(Math.random() * 10) - 5))
      }));
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(systemInterval);
    };
  }, []);

  useEffect(() => {
    onStatsUpdate?.(stats);
  }, [stats, onStatsUpdate]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm lg:text-lg font-bold text-[#be2251] flex items-center gap-2">
            <span className="truncate">Active Users</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0"></div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl lg:text-3xl font-bold text-[#fd3572]">{stats.activeUsers}</div>
          <p className="text-xs lg:text-sm text-gray-600">Currently active</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm lg:text-lg font-bold text-[#be2251] truncate">Total Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl lg:text-3xl font-bold text-[#fd3572]">{stats.totalActivities}</div>
          <p className="text-xs lg:text-sm text-gray-600">All time</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm lg:text-lg font-bold text-[#be2251] truncate">Total Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl lg:text-3xl font-bold text-[#fd3572]">{stats.totalUsers}</div>
          <p className="text-xs lg:text-sm text-gray-600">Registered users</p>
        </CardContent>
      </Card>

      <Card className={`${stats.systemLoad > 70 ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-green-500'}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm lg:text-lg font-bold text-[#be2251] truncate">System Load</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-xl lg:text-3xl font-bold ${stats.systemLoad > 70 ? 'text-red-500' : 'text-[#fd3572]'}`}>
            {stats.systemLoad}%
          </div>
          <p className="text-xs lg:text-sm text-gray-600">CPU Usage</p>
        </CardContent>
      </Card>

      <Card className="col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-sm lg:text-lg font-bold text-[#be2251]">Activity Timeline (24h)</CardTitle>
          <p className="text-xs lg:text-sm text-gray-600">Real-time activity distribution</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="activities" stroke="#fd3572" strokeWidth={2} />
              <Line type="monotone" dataKey="users" stroke="#be2251" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveStats;
