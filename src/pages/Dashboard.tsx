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
import { CalendarIcon, Clock, User, Activity, Plus, FileText, Edit, Trash2, TrendingUp, BarChart3, Target, Award, MapPin, Users } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <MainNavbar />
      
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Enhanced Header Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 mb-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-6 lg:mb-0">
                <h1 className="text-4xl lg:text-5xl font-bold mb-3 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  {greeting}, {userData.full_name || "Welcome"}
                </h1>
                <div className="flex items-center gap-2 text-xl font-semibold mb-2">
                  <Award className="w-6 h-6 text-yellow-300" />
                  <span>Chief Nursing Officer</span>
                </div>
                <div className="flex items-center gap-6 text-sm opacity-90 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>Nakuru County HQ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="font-mono">
                      {currentTime.toLocaleTimeString([], { 
                        hour: "2-digit", 
                        minute: "2-digit", 
                        hour12: true 
                      })}
                    </span>
                  </div>
                </div>
                <p className="text-blue-100">{format(new Date(), "EEEE, MMMM dd, yyyy")}</p>
              </div>
              
              <div className="text-center lg:text-right">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <h3 className="text-lg font-semibold mb-2">County of Unlimited Opportunities</h3>
                  <div className="text-3xl font-bold">{totalActivities}</div>
                  <p className="text-sm opacity-90">Total Activities Logged</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">Real-time synchronized across all devices</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-pink-500 to-rose-600">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
            <CardContent className="p-6 text-white relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{totalActivities}</div>
                  <p className="text-pink-100 text-sm">All Time</p>
                </div>
              </div>
              <h3 className="font-semibold">Total Activities</h3>
              <p className="text-pink-100 text-xs">Complete activity log</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-blue-500 to-cyan-600">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
            <CardContent className="p-6 text-white relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{monthlyActivities}</div>
                  <p className="text-blue-100 text-sm">This Month</p>
                </div>
              </div>
              <h3 className="font-semibold">Monthly Activities</h3>
              <p className="text-blue-100 text-xs">Current month progress</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-emerald-500 to-teal-600">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
            <CardContent className="p-6 text-white relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{totalHours}</div>
                  <p className="text-emerald-100 text-sm">Hours</p>
                </div>
              </div>
              <h3 className="font-semibold">Total Hours</h3>
              <p className="text-emerald-100 text-xs">Time invested</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-amber-500 to-orange-600">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
            <CardContent className="p-6 text-white relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Target className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{averageMinutes}</div>
                  <p className="text-amber-100 text-sm">Minutes</p>
                </div>
              </div>
              <h3 className="font-semibold">Average Duration</h3>
              <p className="text-amber-100 text-xs">Per activity</p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Plus className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Add New Activity</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">Record your daily administrative tasks and track your professional activities</p>
              <Button 
                className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => document.getElementById('activity-form')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Create Activity
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <BarChart3 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">View Activities</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">Browse, manage and analyze all your recorded activities with detailed insights</p>
              <Button 
                variant="outline" 
                className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-xl font-semibold transition-all duration-300"
                onClick={() => navigate('/activities')}
              >
                View All ({totalActivities})
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Generate Reports</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">Export and analyze your activity data with professional reports</p>
              <Button 
                variant="outline" 
                className="border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 px-8 py-3 rounded-xl font-semibold transition-all duration-300"
                onClick={() => navigate('/reports')}
              >
                View Reports
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Activity Form */}
        <div id="activity-form" className="mt-8">
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-t-2xl">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Plus className="h-7 w-7" />
                </div>
                Log New Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="title" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
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
                      className="border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl py-3 px-4 text-lg transition-all duration-200"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="type" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Activity Type
                    </Label>
                    <select
                      id="type"
                      name="type"
                      value={activityData.type}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-xl py-3 px-4 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-lg transition-all duration-200"
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

                <div className="space-y-3">
                  <Label htmlFor="description" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={activityData.description}
                    onChange={handleChange}
                    placeholder="Describe your activity in detail..."
                    rows={4}
                    disabled={loading}
                    className="border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl py-3 px-4 text-lg transition-all duration-200 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="facility" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Facility
                    </Label>
                    <Input
                      id="facility"
                      name="facility"
                      value={activityData.facility}
                      onChange={handleChange}
                      placeholder="Enter facility name"
                      disabled={loading}
                      className="border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl py-3 px-4 text-lg transition-all duration-200"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="duration" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
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
                      className="border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl py-3 px-4 text-lg transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold text-gray-700 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal border-2 border-gray-200 hover:border-indigo-300 rounded-xl py-3 px-4 text-lg h-auto",
                          !date && "text-muted-foreground"
                        )}
                        disabled={loading}
                      >
                        <CalendarIcon className="mr-3 h-5 w-5" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white border-2 border-gray-200 rounded-xl shadow-xl" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={loading}
                        initialFocus
                        className="rounded-xl"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white py-4 text-xl font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Plus className="w-6 h-6" />
                      Log Activity
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Footer Note */}
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-3 bg-white/70 backdrop-blur-sm rounded-full px-6 py-3 border border-gray-200 shadow-lg">
            <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-gray-700 font-medium">Dashboard synchronized in real-time across all your devices</span>
          </div>
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
