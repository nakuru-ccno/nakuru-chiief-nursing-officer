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
import { CalendarIcon } from "lucide-react";
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
      .limit(20);
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
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {greeting},{" "}
            {userData.full_name || userData.email}!
          </h2>
          <span className="font-mono text-base sm:text-lg text-[#fd3572]">
            {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}
          </span>
        </div>
        {/* Activity Submission Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Submit Daily Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
              {error && <div className="text-red-600 font-semibold">{error}</div>}
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  type="text"
                  id="title"
                  name="title"
                  value={activityData.title}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  name="type"
                  value={activityData.type}
                  onChange={handleChange}
                  className="w-full border rounded-md py-2 px-3 bg-background"
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
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={activityData.description}
                  onChange={handleChange}
                  rows={3}
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="facility">Facility</Label>
                <Input
                  type="text"
                  id="facility"
                  name="facility"
                  value={activityData.facility}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  type="number"
                  id="duration"
                  name="duration"
                  value={activityData.duration}
                  onChange={handleChange}
                  min="5"
                  max="720"
                  disabled={loading}
                />
              </div>
              <div>
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                      disabled={loading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center" side="bottom">
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
              <Button type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit Activity"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activities.map((activity) => (
                  <tr key={activity.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {activity.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {activity.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {activity.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {activity.duration} minutes
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
