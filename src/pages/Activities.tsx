
import React, { useState, useEffect } from "react";
import CountyHeader from "@/components/CountyHeader";
import MainNavbar from "@/components/MainNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User, Plus, Trash2, Edit, Wifi, WifiOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Activity {
  id: string;
  title: string;
  type: string;
  date: string;
  duration: number;
  facility: string;
  description: string;
  submitted_by: string;
  created_at: string;
}

const Activities = () => {
  const { toast } = useToast();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    date: new Date().toISOString().split('T')[0],
    duration: "",
    facility: "HQ",
    description: ""
  });

  // Get current user
  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.email) {
      setCurrentUserEmail(user.email);
      console.log('Activities page - Current user set:', user.email);
    } else {
      // Fallback for demo users
      const demoUserEmail = localStorage.getItem("userEmail") || "demo@nakuru.go.ke";
      setCurrentUserEmail(demoUserEmail);
      console.log('Activities page - Demo user set:', demoUserEmail);
    }
  };

  // Real-time activities fetching from Supabase - filtered by current user
  const fetchActivities = async () => {
    if (!currentUserEmail) {
      console.log('No current user email, skipping fetch');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔄 Fetching user activities from Supabase for:', currentUserEmail);
      
      // Filter by current user's email only
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('submitted_by', currentUserEmail)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user activities:', error);
        setIsConnected(false);
        return;
      }

      console.log('✅ Activities page - User activities loaded:', data?.length || 0, 'for user:', currentUserEmail);
      
      const formattedActivities: Activity[] = (data || []).map(activity => ({
        id: activity.id,
        title: activity.title,
        type: activity.type,
        date: activity.date,
        duration: activity.duration || 0,
        facility: activity.facility || 'HQ',
        description: activity.description || '',
        submitted_by: activity.submitted_by || 'User',
        created_at: activity.created_at
      }));

      setActivities(formattedActivities);
      setIsConnected(true);

    } catch (error) {
      console.error('Error fetching user activities:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Set up real-time subscription for current user's activities only
  useEffect(() => {
    if (!currentUserEmail) return;

    let channel: any;

    const setupRealtimeSync = () => {
      console.log('🚀 Setting up real-time sync for user activities:', currentUserEmail);
      
      // Initial fetch
      fetchActivities();

      // Set up real-time subscription filtered by current user
      channel = supabase
        .channel('user-activities-page-sync', {
          config: {
            broadcast: { self: true },
            presence: { key: 'user-activities' }
          }
        })
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'activities',
            filter: `submitted_by=eq.${currentUserEmail}`
          },
          (payload) => {
            console.log('📱 Real-time update in user activities page:', payload.eventType);
            fetchActivities();
          }
        )
        .subscribe((status) => {
          console.log('📡 User activities page sync status:', status);
          setIsConnected(status === 'SUBSCRIBED');
        });
    };

    setupRealtimeSync();

    return () => {
      if (channel) {
        console.log('🧹 Cleaning up user activities sync subscriptions...');
        supabase.removeChannel(channel);
      }
    };
  }, [currentUserEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.type || !formData.duration) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const submittedBy = user?.email || currentUserEmail || 'User';

      const newActivity = {
        title: formData.title,
        type: formData.type,
        date: formData.date,
        duration: parseInt(formData.duration),
        facility: formData.facility,
        description: formData.description,
        submitted_by: submittedBy
      };

      console.log('💾 Saving user activity to Supabase...');
      
      const { data, error } = await supabase
        .from('activities')
        .insert([newActivity])
        .select()
        .single();

      if (error) {
        console.error('Error saving activity:', error);
        toast({
          title: "Error",
          description: "Failed to save activity. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ User activity saved:', data);

      toast({
        title: "Success!",
        description: "Activity saved successfully.",
      });

      // Reset form
      setFormData({
        title: "",
        type: "",
        date: new Date().toISOString().split('T')[0],
        duration: "",
        facility: "HQ",
        description: ""
      });

    } catch (error) {
      console.error('Error saving activity:', error);
      toast({
        title: "Error",
        description: "Failed to save activity. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteActivity = async (id: string) => {
    try {
      console.log('🗑️ Deleting user activity from Supabase...');
      
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id)
        .eq('submitted_by', currentUserEmail); // Extra security check

      if (error) {
        console.error('Error deleting activity:', error);
        toast({
          title: "Error",
          description: "Failed to delete activity. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ User activity deleted');
      
      toast({
        title: "Success!",
        description: "Activity deleted successfully.",
      });

    } catch (error) {
      console.error('Error deleting activity:', error);
      toast({
        title: "Error",
        description: "Failed to delete activity. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      Administrative: "bg-purple-100 text-purple-800",
      Meetings: "bg-blue-100 text-blue-800",
      Training: "bg-green-100 text-green-800",
      Documentation: "bg-yellow-100 text-yellow-800",
      Supervision: "bg-orange-100 text-orange-800",
      General: "bg-gray-100 text-gray-800",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CountyHeader />
        <MainNavbar />
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-[#fd3572] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your activities...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CountyHeader />
      <MainNavbar />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header with Sync Status */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#be2251] mb-2 flex items-center gap-3">
            My Daily Activities
            {isConnected ? (
              <Wifi className="text-green-500" size={24} />
            ) : (
              <WifiOff className="text-red-500" size={24} />
            )}
          </h1>
          <div className="flex items-center gap-2">
            <span className={`text-sm px-3 py-1 rounded-full ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {isConnected ? 'Personal data synced' : 'Syncing...'}
            </span>
            <span className="text-sm text-gray-600">• {activities.length} my activities</span>
            <span className="text-sm text-gray-500">• User: {currentUserEmail}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Activity Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-[#be2251] flex items-center gap-2">
                <Plus size={20} />
                Add New Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Activity Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter activity title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type">Activity Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Administrative">Administrative</SelectItem>
                      <SelectItem value="Meetings">Meetings</SelectItem>
                      <SelectItem value="Training">Training</SelectItem>
                      <SelectItem value="Documentation">Documentation</SelectItem>
                      <SelectItem value="Supervision">Supervision</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (minutes) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      placeholder="e.g., 60"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="facility">Facility</Label>
                  <Select value={formData.facility} onValueChange={(value) => setFormData({...formData, facility: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HQ">HQ</SelectItem>
                      <SelectItem value="Nakuru Referral">Nakuru Referral</SelectItem>
                      <SelectItem value="Kabarak Subcounty">Kabarak Subcounty</SelectItem>
                      <SelectItem value="Molo Subcounty">Molo Subcounty</SelectItem>
                      <SelectItem value="Njoro Subcounty">Njoro Subcounty</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe the activity..."
                    rows={3}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-[#fd3572] to-[#be2251] hover:from-[#be2251] hover:to-[#fd3572]"
                >
                  Save Activity
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* My Activities List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-[#be2251] flex items-center gap-2">
                My Recent Activities
                <div className={`w-2 h-2 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'} rounded-full`}></div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {activities.length > 0 ? (
                  activities.map((activity) => (
                    <div key={activity.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-[#be2251]">{activity.title}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteActivity(activity.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <Badge className={getTypeColor(activity.type)}>
                          {activity.type}
                        </Badge>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(activity.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {activity.duration} min
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {activity.facility}
                          </span>
                        </div>

                        {activity.description && (
                          <p className="text-sm text-gray-700">{activity.description}</p>
                        )}

                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <User size={12} />
                          {activity.submitted_by}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Plus size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No activities yet. Add your first activity!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Activities;
