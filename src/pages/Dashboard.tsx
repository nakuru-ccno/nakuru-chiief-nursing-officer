
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
import { CalendarIcon, Clock, User, Activity, Plus, FileText } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useActivitiesRealtime } from "@/hooks/useActivitiesRealtime";

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
      .order("created_at", { ascending: false })
      .limit(5);
    if (!error) setActivities(data ?? []);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <MainNavbar />
      
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-[#fd3572] to-[#be2251] rounded-xl">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {greeting}, {userData.full_name || "User"}!
                </h1>
                <p className="text-gray-600 mt-1">{userData.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-xl">
              <Clock className="h-5 w-5 text-[#fd3572]" />
              <span className="font-mono text-lg text-gray-800">
                {currentTime.toLocaleTimeString([], { 
                  hour: "2-digit", 
                  minute: "2-digit", 
                  second: "2-digit", 
                  hour12: true 
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Quick Stats */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Today's Activities</p>
                      <p className="text-3xl font-bold">{activities.filter(a => a.date === format(new Date(), "yyyy-MM-dd")).length}</p>
                    </div>
                    <Activity className="h-10 w-10 text-blue-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Total Activities</p>
                      <p className="text-3xl font-bold">{activities.length}</p>
                    </div>
                    <FileText className="h-10 w-10 text-green-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Current Time</p>
                      <p className="text-xl font-bold">{format(new Date(), "MMM dd, yyyy")}</p>
                    </div>
                    <CalendarIcon className="h-10 w-10 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Activity Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-[#fd3572] to-[#be2251] text-white rounded-t-lg">
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
                        className="border-gray-300 focus:border-[#fd3572] focus:ring-[#fd3572]"
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
                        className="w-full border border-gray-300 rounded-md py-2 px-3 bg-white focus:border-[#fd3572] focus:ring-1 focus:ring-[#fd3572]"
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
                      className="border-gray-300 focus:border-[#fd3572] focus:ring-[#fd3572]"
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
                        className="border-gray-300 focus:border-[#fd3572] focus:ring-[#fd3572]"
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
                        className="border-gray-300 focus:border-[#fd3572] focus:ring-[#fd3572]"
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
                    className="w-full bg-gradient-to-r from-[#fd3572] to-[#be2251] hover:from-[#be2251] hover:to-[#9d1e42] text-white py-3 text-lg font-medium"
                  >
                    {loading ? "Submitting..." : "Log Activity"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gray-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Activity className="h-5 w-5 text-[#fd3572]" />
                  Recent Activities
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {activities.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <Activity className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p>No activities yet</p>
                    <p className="text-sm">Log your first activity to get started!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {activities.map((activity, index) => (
                      <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 truncate">
                              {activity.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {activity.type}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {activity.date} • {activity.duration} min
                            </p>
                          </div>
                          <div className={cn(
                            "w-2 h-2 rounded-full flex-shrink-0 mt-2",
                            index === 0 ? "bg-green-500" : "bg-gray-300"
                          )} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
