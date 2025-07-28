import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import EditActivityDialog from "@/components/admin/EditActivityDialog";
import DeleteActivityDialog from "@/components/admin/DeleteActivityDialog";

interface Activity {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
}

const Activities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  const fetchActivities = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching activities", description: error.message });
    } else {
      setActivities(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const toggleCompletion = async (activity: Activity) => {
    const { data, error } = await supabase
      .from("activities")
      .update({ completed: !activity.completed })
      .eq("id", activity.id);

    if (error) {
      toast({ title: "Update failed", description: error.message });
    } else {
      toast({
        title: `Marked as ${!activity.completed ? "Completed" : "Incomplete"}`,
      });
      fetchActivities();
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Daily Activities</h2>
        <Button onClick={() => window.location.href = "/calendar"}>
          <Plus className="mr-2 h-4 w-4" />
          Add via Calendar
        </Button>
      </div>

      {loading ? (
        <p>Loading activities...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity) => (
            <Card key={activity.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold">{activity.title}</CardTitle>
                <Badge variant={activity.completed ? "default" : "secondary"}>
                  {activity.completed ? "Done" : "Pending"}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                <div className="flex justify-between items-center">
                  <Switch
                    checked={activity.completed}
                    onCheckedChange={() => toggleCompletion(activity)}
                  />
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedActivity(activity);
                        setShowEditDialog(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedActivity(activity);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedActivity && (
        <>
          <EditActivityDialog
            open={showEditDialog}
            setOpen={setShowEditDialog}
            activity={selectedActivity}
            onUpdated={fetchActivities}
          />
          <DeleteActivityDialog
            open={showDeleteDialog}
            setOpen={setShowDeleteDialog}
            activityId={selectedActivity.id}
            onDeleted={fetchActivities}
          />
        </>
      )}
    </div>
  );
};

export default Activities;
