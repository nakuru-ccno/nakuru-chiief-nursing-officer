import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MainNavbar from "@/components/MainNavbar";
import CountyHeader from "@/components/CountyHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, Calendar, Clock, Users, FileText, Edit, Trash2, Sun, Moon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useActivitiesRealtime } from "@/hooks/useActivitiesRealtime";
import { useLiveTime } from "@/hooks/useLiveTime";
import EditActivityDialog from "@/components/admin/EditActivityDialog";
import DeleteActivityDialog from "@/components/admin/DeleteActivityDialog";

// Import the SuccessPage
import SuccessPage from "@/components/SuccessPage";

// Add any routing logic to conditionally render SuccessPage after submission if needed

export default function Dashboard() {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [editingActivity, setEditingActivity] = useState(null);
  const [deletingActivity, setDeletingActivity] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { toast } = useToast();
  const { currentTime, greeting } = useLiveTime();
  const navigate = useNavigate();

  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("email", user.email)
          .maybeSingle();

        const displayName = profile?.full_name || 
                            user.user_metadata?.full_name || 
                            user.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 
                            "User";
        const userRole = profile?.role || "User";

        setCurrentUser(displayName);
        setCurrentUserEmail(user.email);
        setCurrentUserRole(userRole);
      } else {
        setCurrentUser("User");
        setCurrentUserEmail("");
        setCurrentUserRole("");
      }
    } catch (error) {
      console.error('Error getting user:', error);
      setCurrentUser("User");
      setCurrentUserEmail("");
      setCurrentUserRole("");
    }
  };

  const fetchActivities = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return setActivities([]);

      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("submitted_by", user.email)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load activities", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    getCurrentUser();
    fetchActivities();
  }, [fetchActivities]);

  useActivitiesRealtime(fetchActivities);

  const handleEditActivity = (activity) => {
    setEditingActivity(activity);
    setIsEditDialogOpen(true);
  };

  const handleDeleteActivity = (activity) => {
    setDeletingActivity(activity);
    setIsDeleteDialogOpen(true);
  };

  const handleActivityUpdated = (updatedActivity) => {
    setActivities(prev => prev.map(activity => activity.id === updatedActivity.id ? updatedActivity : activity));
    setIsEditDialogOpen(false);
    setEditingActivity(null);
    toast({ title: "Success", description: "Activity updated successfully" });
  };

  const handleActivityDeleted = () => {
    if (deletingActivity) {
      setActivities(prev => prev.filter(activity => activity.id !== deletingActivity.id));
      setIsDeleteDialogOpen(false);
      setDeletingActivity(null);
      toast({ title: "Success", description: "Activity deleted successfully" });
    }
  };

  // Example redirect to success page after action (this should be triggered appropriately):
  // useEffect(() => {
  //   if (someSubmissionSuccessCondition) navigate('/success');
  // }, [someSubmissionSuccessCondition]);

  return (
    <div className="min-h-screen bg-gray-50">
      <CountyHeader />
      <MainNavbar />

      {/* Include SuccessPage conditionally if needed */}
      {/* Example: <SuccessPage /> */}

      {/* ... rest of your dashboard code remains the same ... */}

      {editingActivity && (
        <EditActivityDialog
          activity={editingActivity}
          open={isEditDialogOpen}
          onClose={() => { setIsEditDialogOpen(false); setEditingActivity(null); }}
          onActivityUpdated={handleActivityUpdated}
        />
      )}

      {deletingActivity && (
        <DeleteActivityDialog
          activity={deletingActivity}
          open={isDeleteDialogOpen}
          onClose={() => { setIsDeleteDialogOpen(false); setDeletingActivity(null); }}
          onActivityDeleted={handleActivityDeleted}
        />
      )}
    </div>
  );
}
