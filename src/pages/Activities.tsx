
import React, { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import MainNavbar from "@/components/MainNavbar";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useLiveTime } from "@/hooks/useLiveTime";
import ActivityForm, { ActivityType } from "@/components/activities/ActivityForm";
import SuccessPage from "@/components/activities/SuccessPage";

// Interfaces
interface Activity {
  id: string;
  title: string;
  type: string;
  description?: string;
  date: string;
  duration?: number;
  facility?: string;
  submitted_by?: string;
  created_at: string;
}

const Activities = () => {
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedActivity, setSubmittedActivity] = useState<Activity | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentTime, greeting } = useLiveTime();

  const formattedDate = useMemo(
    () =>
      currentTime.toLocaleDateString("en-GB", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    [currentTime]
  );

  const formattedTime = useMemo(
    () =>
      currentTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    [currentTime]
  );

  // Fetch activities
  const { data: activities = [], isLoading, refetch } = useQuery<Activity[]>({
    queryKey: ["activities"],
    queryFn: async () => {
      console.log('🔄 Activities - Fetching activities');
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error('❌ Activities - Error fetching activities:', error);
        toast({
          title: "Failed to load activities",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      console.log('✅ Activities - Activities loaded:', data?.length || 0);
      return data;
    },
  });

  // Fetch activity types
  const { data: activityTypes = [] } = useQuery<ActivityType[]>({
    queryKey: ["activityTypes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_types")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });
      if (error) {
        toast({
          title: "Failed to load activity types",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      return data;
    },
  });

  const handleActivitySubmitted = async (activityData: any) => {
    setIsSubmitting(true);
    try {
      console.log('🔄 Activities - Submitting activity:', activityData);
      
      // Get current user to ensure proper email
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user?.email) {
        throw new Error('User not authenticated');
      }

      const finalActivityData = {
        ...activityData,
        submitted_by: user.email,
        submitted_at: new Date().toISOString(),
      };

      console.log('📝 Activities - Final activity data:', finalActivityData);

      const { data, error } = await supabase
        .from("activities")
        .insert([finalActivityData])
        .select()
        .single();
      
      if (error) {
        console.error('❌ Activities - Error inserting activity:', error);
        throw error;
      }

      console.log('✅ Activities - Activity created successfully:', data);
      setSubmittedActivity(data);
      setShowForm(false);
      setShowSuccess(true);
      
      // Refetch activities to update the list
      await refetch();
      
      toast({ 
        title: "Success!", 
        description: "Activity logged successfully." 
      });
    } catch (err: any) {
      console.error('❌ Activities - Error in handleActivitySubmitted:', err);
      toast({
        title: "Error logging activity",
        description: err.message || "An error occurred while logging the activity.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setShowSuccess(false);
    setSubmittedActivity(null);
  };

  if (showSuccess && submittedActivity) {
    return <SuccessPage activity={submittedActivity} onBack={handleBack} />;
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <MainNavbar />
        <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <ActivityForm
            activityTypes={activityTypes}
            onSubmit={handleActivitySubmitted}
            onCancel={() => setShowForm(false)}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <MainNavbar />
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-8 mb-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black opacity-10" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    {greeting}
                  </h1>
                  <p className="text-blue-100 text-lg">
                    Track your professional activities
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm opacity-90">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono">{formattedTime}</span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              aria-label="Log a new activity"
              size="lg"
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-1"
            >
              <Plus className="w-6 h-6 mr-3" /> Log New Activity
            </Button>
          </div>
        </div>

        {/* Activity List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              Recent Activities
              <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                {activities.length} {activities.length === 1 ? "activity" : "activities"}
              </Badge>
            </h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600 text-lg">Loading...</p>
              </div>
            </div>
          ) : activities.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {activities.map((a) => (
                <Card key={a.id} className="group hover:shadow-xl transition duration-300 shadow-lg bg-white/80 backdrop-blur-sm hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition line-clamp-2">
                      {a.title}
                    </CardTitle>
                    <Badge variant="secondary" className="mt-2 bg-blue-100 text-blue-800 border-blue-200">
                      {a.type}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {a.description && (
                      <CardDescription className="text-gray-600 line-clamp-3">
                        {a.description}
                      </CardDescription>
                    )}
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span>{new Date(a.date).toLocaleDateString("en-GB")}</span>
                      </div>
                      {a.duration && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-green-500" />
                          <span>{a.duration} mins</span>
                        </div>
                      )}
                      {a.facility && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-red-500" />
                          <span>{a.facility}</span>
                        </div>
                      )}
                      {a.submitted_by && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-purple-500" />
                          <span className="truncate">{a.submitted_by}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                      Logged {new Date(a.created_at).toLocaleString("en-GB")}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="text-center py-12">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-12 h-12 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No activities yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Start tracking your professional activities to build your record.
                </p>
                <Button onClick={() => setShowForm(true)} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition">
                  <Plus className="w-5 h-5 mr-2" /> Log Your First Activity
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Activities;
