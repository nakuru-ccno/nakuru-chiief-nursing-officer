
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Users, FileText, Clock, TrendingUp, Activity, Database } from "lucide-react";
import LiveActivityFeed from "./LiveActivityFeed";

interface Stats {
  totalUsers: number;
  totalActivities: number;
  todayActivities: number;
  averageDuration: number;
  activeUsers: number;
}

const LiveStats: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalActivities: 0,
    todayActivities: 0,
    averageDuration: 0,
    activeUsers: 0,
  });
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      console.log('🔄 Admin - Fetching system-wide statistics');
      
      // Check if current user is admin
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser?.user) {
        console.log('❌ No authenticated user found');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.user.id)
        .single();

      const isAdmin = profile?.role === 'admin' || profile?.role === 'System Administrator';
      console.log('👤 Current user admin status:', isAdmin);

      // Fetch all activities (admin sees everything due to RLS policies)
      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select('duration, created_at, submitted_by');

      if (activitiesError) {
        console.error('Error fetching activities for stats:', activitiesError);
        return;
      }

      // Fetch all user profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, created_at, last_sign_in_at');

      if (profilesError) {
        console.error('Error fetching profiles for stats:', profilesError);
        return;
      }

      console.log('✅ Admin - Stats data loaded:', {
        activities: activities?.length || 0,
        profiles: profiles?.length || 0,
        isAdminView: isAdmin
      });

      // Calculate statistics
      const totalActivities = activities?.length || 0;
      const totalUsers = profiles?.length || 0;
      
      // Today's activities
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayActivities = activities?.filter(activity => {
        const activityDate = new Date(activity.created_at);
        return activityDate >= today;
      }).length || 0;

      // Average duration
      const totalDuration = activities?.reduce((sum, activity) => sum + (activity.duration || 0), 0) || 0;
      const averageDuration = totalActivities > 0 ? Math.round(totalDuration / totalActivities) : 0;

      // Active users (users who have logged activities in the last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const activeUserEmails = new Set(
        activities?.filter(activity => new Date(activity.created_at) >= weekAgo)
          .map(activity => activity.submitted_by) || []
      );
      const activeUsers = activeUserEmails.size;

      setStats({
        totalUsers,
        totalActivities,
        todayActivities,
        averageDuration,
        activeUsers,
      });

      setIsConnected(true);
      
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Set up real-time subscription for stats updates
    const channel = supabase
      .channel('admin-stats-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities'
        },
        () => {
          console.log('🔄 Admin - Real-time update detected, refreshing stats');
          fetchStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          console.log('🔄 Admin - Profile update detected, refreshing stats');
          fetchStats();
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System-wide Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
                <p className="text-xs text-gray-500">System-wide</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Activities</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalActivities}</p>
                <p className="text-xs text-gray-500">All time</p>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Today</p>
                <p className="text-2xl font-bold text-purple-600">{stats.todayActivities}</p>
                <p className="text-xs text-gray-500">New activities</p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Duration</p>
                <p className="text-2xl font-bold text-orange-600">{stats.averageDuration}</p>
                <p className="text-xs text-gray-500">Minutes</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-pink-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Users</p>
                <p className="text-2xl font-bold text-pink-600">{stats.activeUsers}</p>
                <p className="text-xs text-gray-500">Last 7 days</p>
              </div>
              <TrendingUp className="h-8 w-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connection Status */}
      <div className="flex items-center gap-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
        <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
          {isConnected ? 'Live data - Real-time updates active' : 'Connection lost - Retrying...'}
        </span>
        <Badge variant="outline" className="ml-2">
          <Database className="w-3 h-3 mr-1" />
          RLS Protected Admin View
        </Badge>
      </div>

      {/* Live Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <LiveActivityFeed />
      </div>
    </div>
  );
};

export default LiveStats;
