
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, PlusCircle, Clock, MapPin, FileText, User, CheckCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import MainNavbar from "@/components/MainNavbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface ActivityType {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

const Activities = () => {
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    date: new Date(),
    duration: "",
    location: "",
    description: ""
  });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

      // Reset form
      setFormData({
        title: "",
        type: "",
        date: new Date(),
        duration: "",
        location: "",
        description: ""
      });

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

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
        
        <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm max-w-md w-full">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Activity Submitted Successfully!
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Your activity has been recorded and will appear in your dashboard.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-blue-600">
                    <ArrowRight className="w-4 h-4" />
                    <span className="text-sm font-medium">Redirecting to dashboard...</span>
                  </div>
                </div>
                
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                >
                  Go to Dashboard Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <MainNavbar />
      
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 rounded-3xl p-8 mb-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl shadow-lg">
                <PlusCircle className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
                  Log Activity
                </h1>
                <p className="text-slate-300 text-lg">Record your daily nursing activities</p>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Form */}
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold">
              <FileText className="h-7 w-7" />
              Activity Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Activity Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-orange-600" />
                    Activity Title *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter activity title"
                    className="h-12 text-lg border-2 border-gray-200 focus:border-orange-500 transition-colors"
                    required
                  />
                </div>

                {/* Activity Type */}
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <User className="w-4 h-4 text-orange-600" />
                    Activity Type *
                  </Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger className="h-12 text-lg border-2 border-gray-200 focus:border-orange-500 bg-white">
                      <SelectValue placeholder="Select activity type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-300 shadow-xl z-[100000] max-h-60 overflow-y-auto">
                      {activityTypes.length > 0 ? (
                        activityTypes.map((type) => (
                          <SelectItem key={type.id} value={type.name} className="cursor-pointer hover:bg-gray-50 py-3 px-4">
                            <div>
                              <div className="font-medium text-gray-900">{type.name}</div>
                              {type.description && (
                                <div className="text-sm text-gray-500 mt-1">{type.description}</div>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-types" disabled className="text-gray-500 py-3 px-4">
                          No activity types available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-orange-600" />
                    Date *
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "h-12 w-full justify-start text-left text-lg border-2 border-gray-200 hover:border-orange-500 transition-colors bg-white",
                          !formData.date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[99999] bg-white border-2 border-gray-200 shadow-2xl">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => date && setFormData(prev => ({ ...prev, date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    Duration (minutes)
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="Enter duration in minutes"
                    className="h-12 text-lg border-2 border-gray-200 focus:border-orange-500 transition-colors"
                    min="1"
                  />
                </div>

                {/* Location */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="location" className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-600" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Enter location (e.g., HQ, Nakuru Level 5 Hospital, Field Office)"
                    className="h-12 text-lg border-2 border-gray-200 focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-lg font-semibold text-gray-800">
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Provide additional details about the activity..."
                  className="min-h-[120px] text-lg border-2 border-gray-200 focus:border-orange-500 transition-colors resize-none"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting Activity...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <PlusCircle className="w-6 h-6" />
                    Submit Activity
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Activities;
