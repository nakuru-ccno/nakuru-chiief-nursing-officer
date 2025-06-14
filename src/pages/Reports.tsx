
import React, { useState, useEffect } from "react";
import MainNavbar from "@/components/MainNavbar";
import CountyHeader from "@/components/CountyHeader";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import EditActivityDialog from "@/components/admin/EditActivityDialog";
import ReportFilters from "@/components/reports/ReportFilters";
import ExportTabs from "@/components/reports/ExportTabs";

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
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string>("");
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Filter states
  const [dateRange, setDateRange] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [activityType, setActivityType] = useState<string>("all");

  const { toast } = useToast();

  useEffect(() => {
    getCurrentUser();
    fetchActivities();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allActivities, dateRange, startDate, endDate, activityType]);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setCurrentUserEmail(user.email);
        const displayName = user.user_metadata?.full_name || 
                           user.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 
                           "User";
        setCurrentUser(displayName);
      } else {
        setCurrentUser("User");
        setCurrentUserEmail("");
      }
    } catch (error) {
      console.error('Error getting current user:', error);
      setCurrentUser("User");
      setCurrentUserEmail("");
    }
  };

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      console.log('📊 Fetching activities for reports...');

      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching activities:', error);
        toast({
          title: "Error",
          description: "Failed to load activities from database",
          variant: "destructive",
        });
        setAllActivities([]);
        return;
      }

      console.log('✅ Activities loaded successfully:', data?.length || 0);
      setAllActivities((data as Activity[]) || []);
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      toast({
        title: "Error",
        description: "Failed to load activities",
        variant: "destructive",
      });
      setAllActivities([]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allActivities];

    if (startDate && endDate) {
      filtered = filtered.filter(activity => {
        const activityDate = new Date(activity.created_at);
        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return activityDate >= start && activityDate <= end;
      });
    }

    if (activityType !== "all") {
      filtered = filtered.filter(activity => 
        activity.type.toLowerCase() === activityType.toLowerCase()
      );
    }

    setFilteredActivities(filtered);
    console.log('🔍 Filters applied, showing:', filtered.length, 'activities');
  };

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 22) return "Good Evening";
    return "Good Night";
  };

  const totalActivities = filteredActivities.length;
  const thisMonth = new Date();
  thisMonth.setDate(1);
  const thisMonthActivities = filteredActivities.filter(activity => {
    const activityDate = new Date(activity.created_at);
    return activityDate >= thisMonth;
  }).length;

  const totalHours = Math.floor(filteredActivities.reduce((sum, activity) => sum + (activity.duration || 0), 0) / 60);
  const uniqueUsers = new Set(filteredActivities.map(activity => activity.submitted_by).filter(Boolean)).size;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CountyHeader />
        <MainNavbar />
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="text-center py-8 text-gray-500">
            <p>Loading activities database...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CountyHeader />
      <MainNavbar />
      
      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">{getGreeting()}, {currentUser}!</h1>
          <p className="text-lg sm:text-xl mb-2">County of Unlimited Opportunities</p>
          <p className="text-sm sm:text-base opacity-90">📊 Professional Reports & Analytics</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 -mt-6">
        <ReportFilters
          dateRange={dateRange}
          setDateRange={setDateRange}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          activityType={activityType}
          setActivityType={setActivityType}
          onApplyFilters={applyFilters}
          totalRecords={filteredActivities.length}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4 sm:p-6">
              <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-1">{totalActivities}</div>
              <div className="text-xs sm:text-sm text-red-700 font-medium">Filtered Activities</div>
              <div className="text-xs text-red-600">Matching criteria</div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 sm:p-6">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">{thisMonthActivities}</div>
              <div className="text-xs sm:text-sm text-blue-700 font-medium">This Month</div>
              <div className="text-xs text-blue-600">Current month</div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 sm:p-6">
              <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">{totalHours}</div>
              <div className="text-xs sm:text-sm text-green-700 font-medium">Total Hours</div>
              <div className="text-xs text-green-600">Hours logged</div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4 sm:p-6">
              <div className="text-2xl sm:text-3xl font-bold text-yellow-600 mb-1">{uniqueUsers}</div>
              <div className="text-xs sm:text-sm text-yellow-700 font-medium">Contributors</div>
              <div className="text-xs text-yellow-600">Unique users</div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <ExportTabs
            activities={filteredActivities}
            dateRange={dateRange}
            startDate={startDate}
            endDate={endDate}
            activityType={activityType}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-green-700">Filtered Activities Preview</CardTitle>
            <p className="text-sm text-gray-600">Preview of activities matching your current filters</p>
          </CardHeader>
          <CardContent>
            {filteredActivities.length > 0 ? (
              <div className="space-y-4">
                {filteredActivities.slice(0, 10).map((activity) => (
                  <div key={activity.id} className="border-l-4 border-l-blue-500 pl-4 py-3 bg-gray-50 rounded-r">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-gray-900 uppercase tracking-wide">
                          {activity.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{activity.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={`${getTypeColor(activity.type)} text-xs`}>
                            {activity.type}
                          </Badge>
                          <span className="text-xs text-gray-500">{activity.duration} min</span>
                          <span className="text-xs text-gray-500">by {activity.submitted_by}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditActivity(activity)}
                          className="text-xs"
                        >
                          <Edit size={12} className="mr-1" />
                          Edit
                        </Button>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">
                            {new Date(activity.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredActivities.length > 10 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">
                      Showing 10 of {filteredActivities.length} filtered activities. Use export options above to get complete reports.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No activities match your current filters. Try adjusting the date range or activity type.</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="text-sm italic text-gray-500 mt-6 text-center">
          Professional reporting system with advanced filtering and export capabilities.
        </div>
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
    </div>
  );
}
