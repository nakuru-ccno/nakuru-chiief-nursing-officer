import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Edit, Trash2 } from "lucide-react";
import EditActivityDialog from "./EditActivityDialog";
import DeleteActivityDialog from "./DeleteActivityDialog";

interface Activity {
  id: string;
  title: string;
  type: string;
  submitted_by: string;
  created_at: string;
  description?: string;
  facility?: string;
  duration?: number;
  date: string;
}

const LiveActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('Connecting...');
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [deletingActivity, setDeletingActivity] = useState<Activity | null>(null);

  const fetchActivities = async () => {
    try {
      console.log('🔄 LiveActivityFeed - Fetching activities with RLS filtering');
      
      // Get current user info
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser?.user) {
        console.log('❌ No authenticated user found in LiveActivityFeed');
        setActivities([]);
        setConnectionStatus('No authenticated user');
        setIsConnected(false);
        return;
      }

      console.log('👤 LiveActivityFeed - Current user email:', currentUser.user.email);

      // Get user profile to check role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.user.id)
        .single();

      const isAdmin = profile?.role === 'admin' || profile?.role === 'System Administrator';
      console.log('🔒 LiveActivityFeed - User role:', profile?.role, 'Is Admin:', isAdmin);

      let query = supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(15);

      // For non-admins, explicitly filter by email to ensure data isolation
      if (!isAdmin && currentUser.user.email) {
        console.log('🔒 LiveActivityFeed - Non-admin user, filtering by email:', currentUser.user.email);
        query = query.eq('submitted_by', currentUser.user.email);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ LiveActivityFeed - Error fetching activities:', error);
        setConnectionStatus('Error fetching data');
        return;
      }

      console.log('✅ LiveActivityFeed - Activities loaded:', data?.length || 0, 'activities');
      console.log('📊 LiveActivityFeed - Activity details:', data?.map(a => ({ 
        id: a.id, 
        submitted_by: a.submitted_by, 
        title: a.title,
        current_user: currentUser.user.email,
        matches_user: a.submitted_by === currentUser.user.email
      })));

      // Double check - filter client side for non-admins as extra security
      let filteredData = data || [];
      if (!isAdmin && currentUser.user.email) {
        filteredData = data?.filter(activity => activity.submitted_by === currentUser.user.email) || [];
        console.log('🔒 LiveActivityFeed - Client-side filtering applied. Showing', filteredData.length, 'activities');
      }

      setActivities(filteredData);
      setConnectionStatus(isAdmin ? 'Connected - Admin View' : 'Connected - Personal View');
      setIsConnected(true);
    } catch (error) {
      console.error('❌ LiveActivityFeed - Error fetching activities:', error);
      setConnectionStatus('Connection error');
      setIsConnected(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    // Initial fetch
    fetchActivities();

    // Simple real-time subscription without aggressive polling
    let activityChannel: any = null;

    const setupConnection = () => {
      activityChannel = supabase
        .channel('activity-feed-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'activities'
          },
          (payload) => {
            console.log('🔥 LiveActivityFeed - Activity update:', payload.eventType);
            if (isMounted) {
              fetchActivities();
            }
          }
        )
        .subscribe((status) => {
          if (isMounted) {
            setIsConnected(status === 'SUBSCRIBED');
            setConnectionStatus(status === 'SUBSCRIBED' ? 'Live - Real-time updates active' : 'Connecting...');
          }
        });
    };

    // Set up subscription after initial load
    setTimeout(() => {
      if (isMounted) {
        setupConnection();
      }
    }, 1000);

    return () => {
      isMounted = false;
      if (activityChannel) {
        supabase.removeChannel(activityChannel);
      }
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
    
    if (hours < 1) return 'bg-green-500';
    if (hours < 6) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
  };

  const handleDeleteActivity = (activity: Activity) => {
    setDeletingActivity(activity);
  };

  const handleActivityUpdated = (updatedActivity: Activity) => {
    setActivities(prev => 
      prev.map(activity => 
        activity.id === updatedActivity.id ? updatedActivity : activity
      )
    );
    setEditingActivity(null);
  };

  const handleActivityDeleted = (deletedId: string) => {
    setActivities(prev => prev.filter(activity => activity.id !== deletedId));
    setDeletingActivity(null);
  };

  return (
    <>
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg font-bold text-[#be2251] flex items-center gap-2">
            Live Activity Feed
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            {isConnected && <span className="text-xs text-green-600 font-normal">LIVE</span>}
          </CardTitle>
          <p className="text-xs sm:text-sm text-gray-600">
            {connectionStatus} • {activities.length} recent activities
          </p>
        </CardHeader>
        <CardContent className="space-y-2 max-h-96 overflow-y-auto px-3 sm:px-6">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <div key={activity.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg gap-2 border-l-4 border-l-gray-300 hover:border-l-[#fd3572] transition-colors group">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
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
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      onClick={() => handleEditActivity(activity)}
                      size="sm"
                      variant="outline"
                      className="h-6 w-6 p-0 border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      <Edit size={12} />
                    </Button>
                    <Button
                      onClick={() => handleDeleteActivity(activity)}
                      size="sm"
                      variant="outline"
                      className="h-6 w-6 p-0 border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
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
                {isConnected ? 'User activities will appear here in real-time across all devices' : connectionStatus}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Activity Dialog */}
      {editingActivity && (
        <EditActivityDialog
          activity={editingActivity}
          open={!!editingActivity}
          onClose={() => setEditingActivity(null)}
          onActivityUpdated={handleActivityUpdated}
        />
      )}

      {/* Delete Activity Dialog */}
      {deletingActivity && (
        <DeleteActivityDialog
          activity={deletingActivity}
          open={!!deletingActivity}
          onClose={() => setDeletingActivity(null)}
          onActivityDeleted={handleActivityDeleted}
        />
      )}
    </>
  );
};

export default LiveActivityFeed;
