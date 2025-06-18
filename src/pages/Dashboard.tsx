import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveTime } from "@/hooks/useLiveTime";
import { supabase } from "@/integrations/supabase/client";
import MainNavbar from "@/components/MainNavbar";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, Clock, User, Activity, Plus, FileText, Edit, Trash2, TrendingUp, BarChart3 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useActivitiesRealtime } from "@/hooks/useActivitiesRealtime";
import EditActivityDialog from "@/components/admin/EditActivityDialog";
import DeleteActivityDialog from "@/components/admin/DeleteActivityDialog";

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentTime, greeting } = useLiveTime();
  const [userData, setUserData] = useState({ email: "", full_name: "", role: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [activityData, setActivityData] = useState({
    title: "",
    type: "Administrative",
    description: "",
    facility: "",
    duration: 30,
    date: format(date || new Date(), "yyyy-MM-dd"),
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [totalActivities, setTotalActivities] = useState(0);
  const [todayActivities, setTodayActivities] = useState(0);
  const [monthlyActivities, setMonthlyActivities] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [averageMinutes, setAverageMinutes] = useState(0);
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [deletingActivity, setDeletingActivity] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const predefinedActivityTypes = [
    "Administrative",
    "Meetings", 
    "Training",
    "Documentation",
    "Supervision",
    "General",
  ];

  const fetchActivities = useCallback(async () => {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      setActivities(data);
      setTotalActivities(data.length);
      
      const today = format(new Date(), "yyyy-MM-dd");
      const currentMonth = format(new Date(), "yyyy-MM");
      
      const todayCount = data.filter(activity => activity.date === today).length;
      const monthlyCount = data.filter(activity => activity.date?.startsWith(currentMonth)).length;
      
      setTodayActivities(todayCount);
      setMonthlyActivities(monthlyCount);
      
      // Calculate total hours and average minutes
      const totalMinutes = data.reduce((sum, activity) => sum + (activity.duration || 0), 0);
      setTotalHours(Math.round((totalMinutes / 60) * 100) / 100);
      setAverageMinutes(data.length > 0 ? Math.round(totalMinutes / data.length) : 0);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  useActivitiesRealtime(fetchActivities);

  useEffect(() => {
    const getUserData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error) {
          console.error("Error fetching user:", error);
          setError(error.message || "Failed to fetch user data.");
          return;
        }

        if (data?.user) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("full_name, role")
            .eq("id", data.user.id)
            .single();

          if (profileError) {
            console.error("Error fetching profile:", profileError);
            setError(
              profileError.message || "Failed to fetch user profile data."
            );
            return;
          }

          setUserData({
            email: data.user.email || "",
            full_name: profile?.full_name || "",
            role: profile?.role || "",
          });
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setActivityData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.from("activities").insert([
        {
          ...activityData,
          submitted_by: userData.email,
          date: format(date || new Date(), "yyyy-MM-dd"),
        },
      ]);

      if (error) {
        setError(error.message || "Failed to submit activity.");
        toast({
          title: "Error",
          description: error.message || "Failed to submit activity.",
          variant: "destructive",
        });
      } else {
        setActivityData({
          title: "",
          type: "Administrative",
          description: "",
          facility: "",
          duration: 30,
          date: format(date || new Date(), "yyyy-MM-dd"),
        });
        setDate(new Date());
        toast({
          title: "Success",
          description: "Activity submitted successfully!",
        });
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred.");
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditActivity = (activity: any) => {
    setEditingActivity(activity);
    setIsEditDialogOpen(true);
  };

  const handleDeleteActivity = (activity: any) => {
    setDeletingActivity(activity);
    setIsDeleteDialogOpen(true);
  };

  const handleActivityUpdated = (updatedActivity: any) => {
    fetchActivities();
    setIsEditDialogOpen(false);
    setEditingActivity(null);
    toast({
      title: "Success",
      description: "Activity updated successfully!",
    });
  };

  const handleActivityDeleted = () => {
    fetchActivities();
    setIsDeleteDialogOpen(false);
    setDeletingActivity(null);
    toast({
      title: "Success",
      description: "Activity deleted successfully!",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />
      
      <div className="max-w-6xl mx-auto p-6">
        {/* Header Section with Gradient */}
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-2xl p-8 mb-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {greeting}, {userData.full_name || "wendy"}
              </h1>
              <p className="text-xl mb-1">Nakuru County Chief Nursing Officer</p>
              <p className="text-lg mb-4">County of Unlimited Opportunities</p>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span>📍</span>
                  <span>Nakuru County HQ</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    {currentTime.toLocaleTimeString([], { 
                      hour: "2-digit", 
                      minute: "2-digit", 
                      second: "2-digit", 
                      hour12: true 
                    })}
                  </span>
                </div>
              </div>
              <p className="text-sm mt-2">{format(new Date(), "EEEE, MMMM dd, yyyy")}</p>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm">⭐ Real-time synchronized across all your devices</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-pink-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Total Activities</h3>
                <TrendingUp className="w-4 h-4 text-pink-500" />
              </div>
              <div className="text-3xl font-bold text-pink-600 mb-1">{totalActivities}</div>
              <p className="text-xs text-gray-500">All time activities</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">This Month</h3>
                <BarChart3 className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-1">{monthlyActivities}</div>
              <p className="text-xs text-gray-500">Activities this month</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Total Hours</h3>
                <Clock className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-1">{totalHours}</div>
              <p className="text-xs text-gray-500">Hours logged</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Average</h3>
                <Activity className="w-4 h-4 text-orange-500" />
              </div>
              <div className="text-3xl font-bold text-orange-600 mb-1">{averageMinutes}</div>
              <p className="text-xs text-gray-500">Minutes per activity</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center p-8 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-pink-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Add New Activity</h3>
            <p className="text-gray-600 text-sm mb-4">Record your daily administrative tasks</p>
            <Button 
              className="bg-pink-500 hover:bg-pink-600 text-white px-8"
              onClick={() => document.getElementById('activity-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Create Activity
            </Button>
          </Card>

          <Card className="text-center p-8 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">View Activities</h3>
            <p className="text-gray-600 text-sm mb-4">Browse and manage all your activities</p>
            <Button 
              variant="outline" 
              className="border-blue-500 text-blue-500 hover:bg-blue-50 px-8"
              onClick={() => navigate('/activities')}
            >
              View All ({totalActivities})
            </Button>
          </Card>

          <Card className="text-center p-8 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Generate Reports</h3>
            <p className="text-gray-600 text-sm mb-4">Export and analyze your activity data</p>
            <Button 
              variant="outline" 
              className="border-green-500 text-green-500 hover:bg-green-50 px-8"
              onClick={() => navigate('/reports')}
            >
              View Reports
            </Button>
          </Card>
        </div>

        {/* Bottom Note */}
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">⭐ Dashboard synchronized in real-time across all your devices</p>
        </div>

        {/* Activity Form - Hidden by default, shown when Create Activity is clicked */}
        <div id="activity-form" className="mt-8">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Plus className="h-6 w-6" />
                Log New Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                      Activity Title
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      value={activityData.title}
                      onChange={handleChange}
                      placeholder="Enter activity title"
                      required
                      disabled={loading}
                      className="border-gray-300 focus:border-pink-500 focus:ring-pink-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-sm font-medium text-gray-700">
                      Activity Type
                    </Label>
                    <select
                      id="type"
                      name="type"
                      value={activityData.type}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md py-2 px-3 bg-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                      disabled={loading}
                      required
                    >
                      {predefinedActivityTypes.map((type) => (
                        <option value={type} key={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={activityData.description}
                    onChange={handleChange}
                    placeholder="Describe your activity..."
                    rows={3}
                    disabled={loading}
                    className="border-gray-300 focus:border-pink-500 focus:ring-pink-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="facility" className="text-sm font-medium text-gray-700">
                      Facility
                    </Label>
                    <Input
                      id="facility"
                      name="facility"
                      value={activityData.facility}
                      onChange={handleChange}
                      placeholder="Enter facility name"
                      disabled={loading}
                      className="border-gray-300 focus:border-pink-500 focus:ring-pink-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
                      Duration (minutes)
                    </Label>
                    <Input
                      type="number"
                      id="duration"
                      name="duration"
                      value={activityData.duration}
                      onChange={handleChange}
                      min="5"
                      max="720"
                      disabled={loading}
                      className="border-gray-300 focus:border-pink-500 focus:ring-pink-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal border-gray-300",
                          !date && "text-muted-foreground"
                        )}
                        disabled={loading}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={loading}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-3 text-lg font-medium"
                >
                  {loading ? "Submitting..." : "Log Activity"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Activity Dialog */}
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

      {/* Delete Activity Dialog */}
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
};

export default Dashboard;
