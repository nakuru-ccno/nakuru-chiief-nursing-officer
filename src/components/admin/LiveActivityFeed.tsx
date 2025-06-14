
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface Activity {
  id: string;
  title: string;
  type: string;
  submitted_by: string;
  created_at: string;
  description?: string;
  facility?: string;
  duration?: number;
}

const LiveActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Enhanced real-time activity fetching
  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(15); // Show more activities for admin monitoring

      if (error) {
        console.error('Error fetching activities for admin live feed:', error);
        return;
      }

      console.log('Admin LiveActivityFeed - Loaded activities:', data?.length || 0);
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities for admin live feed:', error);
    }
  };

  // Load activities and set up enhanced real-time subscription
  useEffect(() => {
    fetchActivities();

    // Set up comprehensive real-time subscription for admin monitoring
    const channel = supabase
      .channel('admin-activities-feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activities'
        },
        (payload) => {
          console.log('Admin LiveActivityFeed - New activity inserted:', payload.new);
          const newActivity = payload.new as Activity;
          setActivities(prev => [newActivity, ...prev.slice(0, 14)]); // Keep latest 15
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'activities'
        },
        (payload) => {
          console.log('Admin LiveActivityFeed - Activity updated:', payload.new);
          const updatedActivity = payload.new as Activity;
          setActivities(prev => 
            prev.map(activity => 
              activity.id === updatedActivity.id ? updatedActivity : activity
            )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'activities'
        },
        (payload) => {
          console.log('Admin LiveActivityFeed - Activity deleted:', payload.old);
          const deletedId = payload.old.id;
          setActivities(prev => prev.filter(activity => activity.id !== deletedId));
        }
      )
      .subscribe((status) => {
        console.log('Admin LiveActivityFeed - Subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Auto-refresh feed every 60 seconds for admin monitoring
    const autoRefreshInterval = setInterval(() => {
      console.log('Admin LiveActivityFeed - Auto-refreshing feed...');
      fetchActivities();
    }, 60000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(autoRefreshInterval);
      setIsConnected(false);
    };
  }, []);

  const getTypeColor = (type: string) => {
    const lowerType = type.toLowerCase();
    switch (lowerType) {
      case 'administrative': return 'bg-purple-100 text-purple-800';
      case 'meetings': return 'bg-blue-100 text-blue-800';
      case 'training': return 'bg-green-100 text-green-800';
      case 'documentation': return 'bg-yellow-100 text-yellow-800';
      case 'supervision': return 'bg-orange-100 text-orange-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diff = now.getTime() - activityTime.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getUserDisplayName = (submittedBy: string) => {
    if (!submittedBy) return 'Unknown User';
    
    // Extract name from email format
    if (submittedBy.includes('@')) {
      const username = submittedBy.split('@')[0];
      return username.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    return submittedBy;
  };

  const getPriorityIndicator = (activity: Activity) => {
    const now = new Date();
    const activityTime = new Date(activity.created_at);
    const diff = now.getTime() - activityTime.getTime();
    const hours = Math.floor(diff / 3600000);
    
    if (hours < 1) return 'bg-green-500'; // Recent activity
    if (hours < 6) return 'bg-yellow-500'; // Moderate
    return 'bg-gray-400'; // Older activity
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg font-bold text-[#be2251] flex items-center gap-2">
          Live Activity Feed
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          {isConnected && <span className="text-xs text-green-600 font-normal">LIVE</span>}
        </CardTitle>
        <p className="text-xs sm:text-sm text-gray-600">
          Real-time user activities across all departments • {activities.length} recent activities
        </p>
      </CardHeader>
      <CardContent className="space-y-2 max-h-96 overflow-y-auto px-3 sm:px-6">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div key={activity.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg gap-2 border-l-4 border-l-gray-300 hover:border-l-[#fd3572] transition-colors">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#fd3572] text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">
                    {getUserDisplayName(activity.submitted_by).charAt(0).toUpperCase()}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getPriorityIndicator(activity)} rounded-full border-2 border-white`}></div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium truncate">
                    <span className="font-bold text-[#be2251]">{getUserDisplayName(activity.submitted_by)}</span> 
                    <span className="text-gray-600"> created activity</span>
                  </p>
                  <p className="text-xs text-gray-900 font-medium truncate">{activity.title}</p>
                  {activity.description && (
                    <p className="text-xs text-gray-500 truncate">{activity.description}</p>
                  )}
                  {activity.facility && (
                    <p className="text-xs text-gray-400">📍 {activity.facility}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge className={`${getTypeColor(activity.type)} text-xs`}>
                  {activity.type}
                </Badge>
                {activity.duration && (
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                    {activity.duration}min
                  </span>
                )}
                <span className="text-xs text-gray-500 whitespace-nowrap font-medium">
                  {formatTime(activity.created_at)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className={`w-3 h-3 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'} rounded-full mx-auto mb-4`}></div>
            <p className="text-sm font-medium">
              {isConnected ? 'No activities yet' : 'Connecting to live feed...'}
            </p>
            <p className="text-xs mt-2">
              {isConnected ? 'User activities will appear here in real-time' : 'Please wait while we establish connection'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveActivityFeed;
