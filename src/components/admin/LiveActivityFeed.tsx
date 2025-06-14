
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

  // Fetch activities from activities table (the correct table that exists)
  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching activities for live feed:', error);
        return;
      }

      console.log('Loaded activities for live feed:', data);
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities for live feed:', error);
    }
  };

  // Load activities on component mount and set up real-time subscription
  useEffect(() => {
    fetchActivities();

    // Set up real-time subscription for new activities
    const channel = supabase
      .channel('activities-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activities'
        },
        (payload) => {
          console.log('New activity inserted:', payload);
          const newActivity = payload.new as Activity;
          setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
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
          console.log('Activity updated:', payload);
          fetchActivities(); // Refresh the list
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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
    return submittedBy || 'Unknown User';
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg font-bold text-[#be2251] flex items-center gap-2">
          Live Activity Feed
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </CardTitle>
        <p className="text-xs sm:text-sm text-gray-600">Real-time user activities</p>
      </CardHeader>
      <CardContent className="space-y-2 max-h-80 overflow-y-auto px-3 sm:px-6">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div key={activity.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#fd3572] text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">
                  {getUserDisplayName(activity.submitted_by).charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium truncate">
                    <span className="font-bold">{getUserDisplayName(activity.submitted_by)}</span> created activity
                  </p>
                  <p className="text-xs text-gray-600 font-medium truncate">{activity.title}</p>
                  {activity.description && (
                    <p className="text-xs text-gray-500 truncate">{activity.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge className={`${getTypeColor(activity.type)} text-xs`}>
                  {activity.type}
                </Badge>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {formatTime(activity.created_at)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No activities yet</p>
            <p className="text-xs mt-2">User activities will appear here in real-time</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveActivityFeed;
