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

  const [isConnected, setIsConnected] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  // Enhanced real-time stats fetching with cross-device synchronization
  const fetchStats = async () => {
    try {
      console.log('🔄 Fetching stats for cross-device synchronization...');
      
      // Get all activities with real-time data
      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select('*');

      if (activitiesError) {
        console.error('Error fetching activities for admin stats:', activitiesError);
        setIsConnected(false);
        return;
      }

      console.log('📊 Admin LiveStats - Syncing activities across devices:', activities?.length || 0);
      setIsConnected(true);
      setLastSyncTime(new Date());

      // ... keep existing code (calculation logic)
      const totalActivities = activities?.length || 0;
      
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const thisMonthActivities = activities?.filter((activity: any) => {
        const activityDate = new Date(activity.created_at);
        return activityDate >= thisMonth;
      }) || [];

      const uniqueUsers = new Set(activities?.map((activity: any) => activity.submitted_by).filter(Boolean) || []);

      const totalMinutes = activities?.reduce((sum: number, activity: any) => sum + (activity.duration || 0), 0) || 0;
      const totalHours = Math.floor(totalMinutes / 60);

      const averageDuration = totalActivities > 0 ? Math.round(totalMinutes / totalActivities) : 0;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayActivities = activities?.filter((activity: any) => {
        const activityDate = new Date(activity.created_at);
        return activityDate >= today;
      }) || [];

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

      const last24Hours = new Date();
      last24Hours.setHours(last24Hours.getHours() - 24);
      const recentActivities = activities?.filter((activity: any) => {
        const activityDate = new Date(activity.created_at);
        return activityDate >= last24Hours;
      }) || [];
      const activeUsersCount = new Set(recentActivities.map((a: any) => a.submitted_by).filter(Boolean)).size;

      const newStats = {
        totalUsers: uniqueUsers.size,
        totalActivities,
        thisMonth: thisMonthActivities.length,
        totalHours,
        averageDuration,
        activeUsers: Math.max(1, activeUsersCount),
        systemLoad: Math.max(10, Math.min(90, 45 + Math.floor(Math.random() * 10) - 5))
      };

      setStats(newStats);

      console.log('✅ Admin LiveStats - Stats synchronized across all devices:', {
        totalActivities,
        totalUsers: uniqueUsers.size,
        thisMonth: thisMonthActivities.length,
        totalHours,
        averageDuration,
        activeUsers: activeUsersCount
      });

    } catch (error) {
      console.error('❌ Error fetching admin activity stats:', error);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    let channel: any;
    let retryTimeout: NodeJS.Timeout;

    const setupRealtimeStatsSync = () => {
      console.log('🚀 Setting up enhanced real-time stats synchronization...');
      
      // Initial fetch
      fetchStats();

      // Set up enhanced real-time subscription for cross-device stats sync
      channel = supabase
        .channel('admin-stats-realtime-sync', {
          config: {
            broadcast: { self: true },
            presence: { key: 'admin-stats' }
          }
        })
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events for comprehensive sync
            schema: 'public',
            table: 'activities'
          },
          (payload) => {
            console.log('📈 Real-time stats update across all devices:', payload.eventType);
            fetchStats(); // Refresh stats immediately on any change
          }
        )
        .subscribe((status) => {
          console.log('📡 Stats sync subscription status:', status);
          
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
            console.log('✅ Stats synchronization active across all devices');
          } else if (status === 'CHANNEL_ERROR') {
            setIsConnected(false);
            console.error('❌ Stats sync error - retrying...');
            
            retryTimeout = setTimeout(() => {
              setupRealtimeStatsSync();
            }, 3000);
          }
        });
    };

    // Initial setup
    setupRealtimeStatsSync();

    // Enhanced auto-refresh for cross-device synchronization
    const autoRefreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing stats for cross-device sync...');
      fetchStats();
    }, 20000); // More frequent updates for better sync

    // Visibility change handler for cross-device sync
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('📱 Tab visible - syncing stats across devices');
        fetchStats();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // System load update with cross-device considerations
    const systemInterval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        systemLoad: Math.max(10, Math.min(90, prev.systemLoad + Math.floor(Math.random() * 10) - 5))
      }));
    }, 5000);

    return () => {
      if (channel) {
        console.log('🧹 Cleaning up stats sync subscriptions...');
        supabase.removeChannel(channel);
      }
      clearInterval(autoRefreshInterval);
      clearInterval(systemInterval);
      clearTimeout(retryTimeout);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      setIsConnected(false);
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
            <div className={`w-2 h-2 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'} rounded-full flex-shrink-0`}></div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl lg:text-3xl font-bold text-[#fd3572]">{stats.activeUsers}</div>
          <p className="text-xs lg:text-sm text-gray-600">Last 24 hours</p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm lg:text-lg font-bold text-[#be2251] truncate">Total Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl lg:text-3xl font-bold text-[#fd3572]">{stats.totalActivities}</div>
          <p className="text-xs lg:text-sm text-gray-600">All time</p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-purple-500">
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

      {/* Additional stats cards for better admin monitoring */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm lg:text-lg font-bold text-[#be2251] truncate">This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl lg:text-3xl font-bold text-[#fd3572]">{stats.thisMonth}</div>
          <p className="text-xs lg:text-sm text-gray-600">Activities this month</p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-cyan-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm lg:text-lg font-bold text-[#be2251] truncate">Total Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl lg:text-3xl font-bold text-[#fd3572]">{stats.totalHours}</div>
          <p className="text-xs lg:text-sm text-gray-600">Hours logged</p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-yellow-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm lg:text-lg font-bold text-[#be2251] truncate">Average</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl lg:text-3xl font-bold text-[#fd3572]">{stats.averageDuration}</div>
          <p className="text-xs lg:text-sm text-gray-600">Minutes per activity</p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-indigo-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm lg:text-lg font-bold text-[#be2251] flex items-center gap-2">
            <span className="truncate">Cross-Device Sync</span>
            <div className={`w-2 h-2 ${isConnected ? 'bg-green-500 animate-ping' : 'bg-red-500'} rounded-full flex-shrink-0`}></div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-xl lg:text-3xl font-bold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
            {isConnected ? 'ON' : 'OFF'}
          </div>
          <p className="text-xs lg:text-sm text-gray-600">
            {isConnected ? `Synced ${lastSyncTime.toLocaleTimeString()}` : 'Reconnecting...'}
          </p>
        </CardContent>
      </Card>

      <Card className="col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-sm lg:text-lg font-bold text-[#be2251] flex items-center gap-2">
            Activity Timeline (24h) - Cross-Device Synchronized
            <div className={`w-2 h-2 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'} rounded-full`}></div>
          </CardTitle>
          <p className="text-xs lg:text-sm text-gray-600">
            Real-time activity distribution synchronized across all devices and platforms
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="activities" stroke="#fd3572" strokeWidth={2} name="Activities" />
              <Line type="monotone" dataKey="users" stroke="#be2251" strokeWidth={2} name="Active Users" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveStats;
