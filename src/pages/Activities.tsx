
import React, { useState } from "react";
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
import { Plus, Calendar, Clock, MapPin, User, FileText } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useLiveTime } from "@/hooks/useLiveTime";
import ActivityForm from "@/components/activities/ActivityForm";
import SuccessPage from "@/components/activities/SuccessPage";

const Activities = () => {
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedActivity, setSubmittedActivity] = useState<any>(null);
  const { currentTime, greeting } = useLiveTime();

  const { data: activities, isLoading, refetch } = useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      console.log("🔄 Fetching activities...");
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Error fetching activities:", error);
        throw error;
      }

      console.log("✅ Activities fetched:", data?.length || 0);
      return data;
    },
  });

  const handleActivitySubmitted = (activity: any) => {
    console.log("✅ Activity submitted successfully:", activity);
    setSubmittedActivity(activity);
    setShowForm(false);
    setShowSuccess(true);
    refetch();
    
    toast({
      title: "Success!",
      description: "Your activity has been logged successfully.",
    });
  };

  const handleBackToActivities = () => {
    setShowSuccess(false);
    setSubmittedActivity(null);
  };

  if (showSuccess && submittedActivity) {
    return (
      <SuccessPage 
        activity={submittedActivity}
        onBack={handleBackToActivities}
      />
    );
  }

  if (showForm) {
    return (
      <ActivityForm
        onSubmit={handleActivitySubmitted}
        onCancel={() => setShowForm(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <MainNavbar />
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Enhanced Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-8 mb-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-6 lg:mb-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                      {greeting}
                    </h1>
                    <p className="text-blue-100 text-lg">Track your professional activities with ease</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 text-sm opacity-90">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{currentTime.toLocaleDateString('en-GB', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
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
              </div>
              
              <div className="text-center lg:text-right">
                <Button
                  onClick={() => setShowForm(true)}
                  size="lg"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 px-8 py-4 text-lg font-semibold"
                >
                  <Plus className="w-6 h-6 mr-3" />
                  Log New Activity
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Activities Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              Recent Activities
              {activities && (
                <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                  {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
                </Badge>
              )}
            </h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Loading your activities...</p>
              </div>
            </div>
          ) : activities && activities.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activities.map((activity) => (
                <Card key={activity.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                          {activity.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                            {activity.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {activity.description && (
                      <CardDescription className="text-gray-600 line-clamp-3">
                        {activity.description}
                      </CardDescription>
                    )}
                    
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span>{new Date(activity.date).toLocaleDateString('en-GB')}</span>
                      </div>
                      
                      {activity.duration && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-green-500" />
                          <span>{activity.duration} minutes</span>
                        </div>
                      )}
                      
                      {activity.facility && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-red-500" />
                          <span>{activity.facility}</span>
                        </div>
                      )}
                      
                      {activity.submitted_by && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-purple-500" />
                          <span className="truncate">{activity.submitted_by}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-400">
                        Logged {new Date(activity.created_at).toLocaleString('en-GB')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <FileText className="w-12 h-12 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No activities yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Start tracking your professional activities to build a comprehensive record of your nursing practice.
                </p>
                <Button 
                  onClick={() => setShowForm(true)}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Log Your First Activity
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
