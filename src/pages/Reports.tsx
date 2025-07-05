
import React, { useState, useEffect, useCallback } from "react";
import MainNavbar from "@/components/MainNavbar";
import CountyHeader from "@/components/CountyHeader";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, FileText, Calendar, Clock, Users, Shield } from "lucide-react";
import EditActivityDialog from "@/components/admin/EditActivityDialog";
import ReportsExportDialog from "@/components/reports/ReportsExportDialog";
import { useActivitiesRealtime } from "@/hooks/useActivitiesRealtime";

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

export default function Reports() {
  const [allActivities, setAllActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string>("");
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    console.log('📊 Reports component mounted');
    getCurrentUser();
    fetchActivities();
  }, []);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        const displayName = user.user_metadata?.full_name || 
                           user.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 
                           "User";
        setCurrentUser(displayName);
        setCurrentUserEmail(user.email);
        
        // Check user role from profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('email', user.email)
          .single();
        
        const userRole = profile?.role || "User";
        setCurrentUserRole(userRole);
        
        // Check if user is admin
        const adminRoles = ['admin', 'System Administrator'];
        setIsAdmin(adminRoles.includes(userRole));
        
        console.log('👤 Reports - Current user:', displayName, 'Email:', user.email, 'Role:', userRole, 'IsAdmin:', adminRoles.includes(userRole));
      } else {
        setCurrentUser("User");
        setCurrentUserEmail("");
        setCurrentUserRole("");
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('❌ Reports - Error getting current user:', error);
      setCurrentUser("User");
      setCurrentUserEmail("");
      setCurrentUserRole("");
      setIsAdmin(false);
    }
  };

  const fetchActivities = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('📊 Reports - Fetching activities');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        console.log('❌ Reports - No authenticated user found');
        setAllActivities([]);
        return;
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('email', user.email)
        .single();
      
      const userRole = profile?.role || "User";
      const adminRoles = ['admin', 'System Administrator'];
      const userIsAdmin = adminRoles.includes(userRole);

      console.log('🔐 Reports - Current user role:', userRole, 'IsAdmin:', userIsAdmin);

      let query = supabase.from("activities").select("*");
      
      // If not admin, filter by user email
      if (!userIsAdmin) {
        query = query.eq('submitted_by', user.email);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });
      
      if (error) {
        console.error('❌ Reports - Error fetching activities:', error);
        toast({
          title: "Error",
          description: "Failed to load activities",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Reports - Activities loaded:', data?.length || 0);
      console.log('📊 Reports - Raw activities data:', data);
      setAllActivities(data || []);
    } catch (error) {
      console.error('❌ Reports - Error fetching activities:', error);
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
    fetchActivities();
  }, [fetchActivities]);

  useActivitiesRealtime(fetchActivities);

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setIsEditDialogOpen(true);
  };

  const handleActivityUpdated = (updatedActivity: Activity) => {
    setAllActivities(prev => 
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
  const totalActivities = allActivities.length;
  console.log('📊 Reports - Total activities calculated:', totalActivities);
  
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);
  const thisMonthActivities = allActivities.filter(activity => {
    const activityDate = new Date(activity.created_at);
    return activityDate >= thisMonth;
  }).length;
  console.log('📊 Reports - This month activities:', thisMonthActivities);
  
  const totalHours = Math.floor(allActivities.reduce((sum, activity) => sum + (activity.duration || 0), 0) / 60);
  const averageDuration = totalActivities > 0 ? Math.round(allActivities.reduce((sum, activity) => sum + (activity.duration || 0), 0) / totalActivities) : 0;

  // Get unique users count (for admin view)
  const uniqueUsers = new Set(allActivities.map(activity => activity.submitted_by)).size;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CountyHeader />
        <MainNavbar />
        <div className="max-w-7xl mx-auto p-8">
          <div className="text-center py-8 text-gray-500">
            <p>Loading reports...</p>
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
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {isAdmin ? 'All Activity Reports' : 'My Activity Reports'}
            </h1>
            {isAdmin && (
              <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Admin View
              </Badge>
            )}
          </div>
          <p className="text-gray-600">
            {isAdmin 
              ? `System-wide analysis of all user activities - Viewing as ${currentUserRole}` 
              : `Personal analysis of your daily activities - ${currentUserEmail}`
            }
          </p>
          <div className="flex justify-end mt-4">
            <Button 
              className="bg-pink-500 hover:bg-pink-600 text-white"
              onClick={() => setIsExportDialogOpen(true)}
            >
              <FileText className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {isAdmin ? 'Total Activities' : 'My Total Activities'}
                  </p>
                  <p className="text-3xl font-bold text-red-600">{totalActivities}</p>
                  <p className="text-xs text-gray-500">
                    {isAdmin ? 'All activities recorded' : 'Your activities recorded'}
                  </p>
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
                  <p className="text-xs text-gray-500">
                    {isAdmin ? 'All activities this month' : 'Your activities this month'}
                  </p>
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
                  <p className="text-xs text-gray-500">
                    {isAdmin ? 'All hours of activities' : 'Your hours of activities'}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {isAdmin ? 'Active Users' : 'Average Duration'}
                  </p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {isAdmin ? uniqueUsers : averageDuration}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isAdmin ? 'Users with activities' : 'Minutes per activity'}
                  </p>
                </div>
                <Users className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">
              {isAdmin ? 'All Recent Activities' : 'My Recent Activities'}
            </CardTitle>
            <p className="text-sm text-gray-600">
              {isAdmin 
                ? 'Latest recorded activities from all users with detailed information'
                : 'Your latest recorded activities with detailed information'
              }
            </p>
          </CardHeader>
          <CardContent>
            {allActivities.length > 0 ? (
              <div className="space-y-4">
                {allActivities.slice(0, 10).map((activity) => (
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
                      {(isAdmin || activity.submitted_by === currentUserEmail) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditActivity(activity)}
                          className="ml-4"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {allActivities.length > 10 && (
                  <div className="text-center py-4 border-t">
                    <p className="text-sm text-gray-500">
                      Showing 10 of {allActivities.length} activities
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No activities found</p>
                <p className="text-sm text-gray-400">
                  {isAdmin ? 'No activities have been logged yet' : 'Start logging activities to see your reports here'}
                </p>
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

      <ReportsExportDialog
        open={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        activities={allActivities}
      />
    </div>
  );
}
