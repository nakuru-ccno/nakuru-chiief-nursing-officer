import React, { useState, useEffect, useCallback } from "react";
import MainNavbar from "@/components/MainNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, Calendar, Clock, Users, FileText, Edit, Trash2, Sun, Moon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useActivitiesRealtime } from "@/hooks/useActivitiesRealtime";
import { useLiveTime } from "@/hooks/useLiveTime";
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
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [deletingActivity, setDeletingActivity] = useState<Activity | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { toast } = useToast();

  // Live time hook
  const { currentTime, greeting } = useLiveTime();

  // Format time with seconds
  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Theme toggle
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        // Get user profile for role information
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("email", user.email)
          .maybeSingle();

        const displayName = profile?.full_name || 
                           user.user_metadata?.full_name || 
                           user.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 
                           "User";
        
        const userRole = profile?.role || "User";
        
        setCurrentUser(displayName);
        setCurrentUserEmail(user.email);
        setCurrentUserRole(userRole);
        console.log('👤 Dashboard - Current user:', displayName, 'Email:', user.email, 'Role:', userRole);
      } else {
        setCurrentUser("User");
        setCurrentUserEmail("");
        setCurrentUserRole("");
      }
    } catch (error) {
      console.error('❌ Dashboard - Error getting current user:', error);
      setCurrentUser("User");
      setCurrentUserEmail("");
      setCurrentUserRole("");
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

  // Enhanced real-time updates
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

  // Calculate statistics
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
      <MainNavbar />
      
      <div className="max-w-7xl mx-auto p-8">
        {/* Enhanced Header with Role and Live Time */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {currentUser}!
          </h1>
          {currentUserRole && (
            <h2 className="text-xl font-semibold text-blue-600 mb-2">
              {currentUserRole}
            </h2>
          )}
          
          {/* Live Time Display with Greeting */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-lg font-semibold text-blue-800">{greeting}</span>
                </div>
                <div className="flex items-center gap-2 text-blue-700">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono text-lg font-bold">{formatTime()}</span>
                </div>
                <span className="text-sm text-blue-600">{formatDate()}</span>
              </div>
              
              {/* Light/Dark Mode Toggle */}
              <div className="flex items-center gap-3 bg-white/50 rounded-lg px-3 py-2">
                <Sun className="w-4 h-4 text-yellow-500" />
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={toggleTheme}
                  className="data-[state=checked]:bg-slate-700"
                />
                <Moon className="w-4 h-4 text-slate-600" />
              </div>
            </div>
          </div>
          
          <p className="text-gray-600">Here's an overview of your activities - {currentUserEmail}</p>
          <div className="mt-4 bg-green-100 border border-green-300 rounded-lg px-4 py-2 inline-flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <span className="text-green-700 font-medium">Personal view - Your data only via RLS</span>
          </div>
        </div>

        {/* Stats Cards with Real-time Badge */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-red-500 relative">
            <div className="absolute top-2 right-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">My Total Activities</p>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-bold text-red-600">{totalActivities}</p>
                    <Badge className="bg-green-100 text-green-800 text-xs">Live</Badge>
                  </div>
                  <p className="text-xs text-gray-500">Your activities recorded</p>
                </div>
                <FileText className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 relative">
            <div className="absolute top-2 right-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">This Month</p>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-bold text-blue-600">{thisMonthActivities}</p>
                    <Badge className="bg-green-100 text-green-800 text-xs">Live</Badge>
                  </div>
                  <p className="text-xs text-gray-500">Your activities this month</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 relative">
            <div className="absolute top-2 right-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Hours</p>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-bold text-green-600">{totalHours}</p>
                    <Badge className="bg-green-100 text-green-800 text-xs">Live</Badge>
                  </div>
                  <p className="text-xs text-gray-500">Your hours of activities</p>
                </div>
                <Clock className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500 relative">
            <div className="absolute top-2 right-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Average Duration</p>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-bold text-yellow-600">{averageDuration}</p>
                    <Badge className="bg-green-100 text-green-800 text-xs">Live</Badge>
                  </div>
                  <p className="text-xs text-gray-500">Minutes per activity</p>
                </div>
                <Users className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities with Real-time indicator */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3">
                  <CardTitle className="text-xl font-semibold text-gray-800">Recent Activities</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <Badge className="bg-green-100 text-green-800 text-xs">Real-time updates</Badge>
                  </div>
                </div>
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

