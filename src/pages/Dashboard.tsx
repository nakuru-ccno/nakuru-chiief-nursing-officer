import React, { useState, useEffect, useCallback } from "react";
import MainNavbar from "@/components/MainNavbar";
import CountyHeader from "@/components/CountyHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Clock, Users, FileText, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useActivitiesRealtime } from "@/hooks/useActivitiesRealtime";
import EditActivityDialog from "@/components/admin/EditActivityDialog";
import DeleteActivityDialog from "@/components/admin/DeleteActivityDialog";

interface Activity {
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
}

export default function Dashboard() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string>("");
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [deletingActivity, setDeletingActivity] = useState<Activity | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        const displayName = user.user_metadata?.full_name || 
                           user.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 
                           "User";
        setCurrentUser(displayName);
        setCurrentUserEmail(user.email);
        console.log('👤 Dashboard - Current user:', displayName, 'Email:', user.email);
      } else {
        setCurrentUser("User");
        setCurrentUserEmail("");
      }
    } catch (error) {
      console.error('❌ Dashboard - Error getting current user:', error);
      setCurrentUser("User");
      setCurrentUserEmail("");
    }
  };
  
  const fetchActivities = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('🏠 Dashboard - Fetching user activities');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        console.log('❌ Dashboard - No authenticated user found');
        setActivities([]);
        return;
      }

      console.log('🔐 Dashboard - Current authenticated user:', user.email);

      // Use exactly the same query as Reports page for consistency
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq('submitted_by', user.email)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error('❌ Dashboard - Error fetching activities:', error);
        toast({
          title: "Error",
          description: "Failed to load activities",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Dashboard - Activities loaded:', data?.length || 0);
      console.log('📊 Dashboard - Raw activities data:', data);
      setActivities(data || []);
    } catch (error) {
      console.error('❌ Dashboard - Error fetching activities:', error);
      toast({
        title: "Error",
        description: "Failed to load activities",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    getCurrentUser();
    fetchActivities();
  }, [fetchActivities]);

  useActivitiesRealtime(fetchActivities);

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setIsEditDialogOpen(true);
  };

  const handleDeleteActivity = (activity: Activity) => {
    setDeletingActivity(activity);
    setIsDeleteDialogOpen(true);
  };

  const handleActivityUpdated = (updatedActivity: Activity) => {
    setActivities(prev => 
      prev.map(activity => 
        activity.id === updatedActivity.id ? updatedActivity : activity
      )
    );
    setIsEditDialogOpen(false);
    setEditingActivity(null);
    toast({
      title: "Success",
      description: "Activity updated successfully",
    });
  };

  const handleActivityDeleted = () => {
    if (deletingActivity) {
      setActivities(prev => prev.filter(activity => activity.id !== deletingActivity.id));
      setIsDeleteDialogOpen(false);
      setDeletingActivity(null);
      toast({
        title: "Success",
        description: "Activity deleted successfully",
      });
    }
  };

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

  // Calculate statistics using exactly the same logic as Reports page
  const totalActivities = activities.length;
  console.log('📊 Dashboard - Total activities calculated:', totalActivities);
  
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);
  const thisMonthActivities = activities.filter(activity => {
    const activityDate = new Date(activity.created_at);
    return activityDate >= thisMonth;
  }).length;
  console.log('📊 Dashboard - This month activities:', thisMonthActivities);
  
  const totalHours = Math.floor(activities.reduce((sum, activity) => sum + (activity.duration || 0), 0) / 60);
  const averageDuration = totalActivities > 0 ? Math.round(activities.reduce((sum, activity) => sum + (activity.duration || 0), 0) / totalActivities) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CountyHeader />
        <MainNavbar />
        <div className="max-w-7xl mx-auto p-8">
          <div className="text-center py-8 text-gray-500">
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CountyHeader />
      <MainNavbar />
      
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {currentUser}!
          </h1>
          <p className="text-gray-600">Here's an overview of your activities - {currentUserEmail}</p>
        </div>

        {/* Stats Cards - Using same calculation as Reports page */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">My Total Activities</p>
                  <p className="text-3xl font-bold text-red-600">{totalActivities}</p>
                  <p className="text-xs text-gray-500">Your activities recorded</p>
                </div>
                <FileText className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">This Month</p>
                  <p className="text-3xl font-bold text-blue-600">{thisMonthActivities}</p>
                  <p className="text-xs text-gray-500">Your activities this month</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Hours</p>
                  <p className="text-3xl font-bold text-green-600">{totalHours}</p>
                  <p className="text-xs text-gray-500">Your hours of activities</p>
                </div>
                <Clock className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Average Duration</p>
                  <p className="text-3xl font-bold text-yellow-600">{averageDuration}</p>
                  <p className="text-xs text-gray-500">Minutes per activity</p>
                </div>
                <Users className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-800">Recent Activities</CardTitle>
                <p className="text-sm text-gray-600">Your latest activities</p>
              </div>
              <Button size="sm" className="bg-pink-500 hover:bg-pink-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Activity
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {activities.length > 0 ? (
              <div className="space-y-4">
                {activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                          <Badge className={`${getTypeColor(activity.type)} text-xs`}>
                            {activity.type}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                          {activity.description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(activity.created_at).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {activity.duration} minutes
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {activity.submitted_by}
                          </span>
                          {activity.facility && (
                            <span>Facility: {activity.facility}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditActivity(activity)}
                          className="ml-4"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteActivity(activity)}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {activities.length > 5 && (
                  <div className="text-center py-4 border-t">
                    <p className="text-sm text-gray-500">
                      Showing 5 of {activities.length} activities
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No activities found</p>
                <p className="text-sm text-gray-400">Start logging activities to see them here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {editingActivity && (
        <EditActivityDialog
          activity={editingActivity}
          open={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setEditingActivity(null);
          }}
          onActivityUpdated={handleActivityUpdated}
        />
      )}

      {deletingActivity && (
        <DeleteActivityDialog
          activity={deletingActivity}
          open={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setDeletingActivity(null);
          }}
          onActivityDeleted={handleActivityDeleted}
        />
      )}
    </div>
  );
}
