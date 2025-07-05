
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, FileText, Sparkles } from "lucide-react";
import MainNavbar from "@/components/MainNavbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import ActivityForm from "@/components/activities/ActivityForm";
import SuccessPage from "@/components/activities/SuccessPage";

interface ActivityType {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

const Activities = () => {
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchActivityTypes();
  }, []);

  const fetchActivityTypes = async () => {
    try {
      console.log('🔄 Fetching activity types from database');
      const { data, error } = await supabase
        .from('activity_types')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('❌ Error fetching activity types:', error);
        toast({
          title: "Warning",
          description: "Failed to load activity types. Please contact your administrator.",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Activity types loaded:', data?.length || 0);
      setActivityTypes(data || []);
      
      if (!data || data.length === 0) {
        console.log('⚠️ No activity types found in database');
        toast({
          title: "No Activity Types",
          description: "No activity types available. Please contact your administrator to add activity types.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Error in fetchActivityTypes:', error);
      toast({
        title: "Error",
        description: "Failed to load activity types. Please try refreshing the page.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (formData: any) => {
    if (!formData.title || !formData.type) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to submit activities",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('activities')
        .insert([
          {
            title: formData.title,
            type: formData.type,
            date: format(formData.date, 'yyyy-MM-dd'),
            duration: formData.duration ? parseInt(formData.duration) : null,
            facility: formData.location || null,
            description: formData.description || null,
            submitted_by: user.email,
            submitted_at: new Date().toISOString()
          }
        ]);

      if (error) {
        console.error('Error submitting activity:', error);
        toast({
          title: "Error",
          description: "Failed to submit activity. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Show success state
      setShowSuccess(true);
      
      toast({
        title: "Success!",
        description: "Activity submitted successfully! Redirecting to dashboard...",
      });

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (error) {
      console.error('Error submitting activity:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state component
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <MainNavbar />
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <SuccessPage />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <MainNavbar />
      
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Enhanced Hero Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 rounded-3xl p-12 mb-12 text-white shadow-2xl">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-orange-500/10 to-red-500/10"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full -ml-32 -mb-32"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-6 mb-6">
              <div className="p-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl shadow-xl">
                <PlusCircle className="w-12 h-12" />
              </div>
              <div>
                <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-orange-100 to-red-100 bg-clip-text text-transparent mb-2">
                  Log New Activity
                </h1>
                <p className="text-slate-300 text-xl">Record your daily nursing activities with ease</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-orange-200">
              <Sparkles className="w-5 h-5" />
              <span className="text-lg">Enhanced modern interface for better user experience</span>
            </div>
          </div>
        </div>

        {/* Main Activity Form Card */}
        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-orange-600 via-red-500 to-pink-600 text-white p-8">
            <CardTitle className="flex items-center gap-4 text-3xl font-bold">
              <FileText className="h-8 w-8" />
              Activity Details
            </CardTitle>
            <p className="text-orange-100 text-lg mt-2">
              Please fill out the form below to record your activity
            </p>
          </CardHeader>
          
          <CardContent className="p-12">
            <ActivityForm
              activityTypes={activityTypes}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </CardContent>
        </Card>

        {/* Quick Tips Card */}
        <Card className="mt-8 border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Quick Tips
            </h3>
            <ul className="space-y-2 text-blue-700">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                Be descriptive in your activity title for better tracking
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                Include duration to help with time management analysis
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                Add location details for comprehensive reporting
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Activities;
