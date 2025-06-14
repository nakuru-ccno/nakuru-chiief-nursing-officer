import React, { useState, useEffect } from "react";
import CountyHeader from "@/components/CountyHeader";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EditActivityDialog from "@/components/admin/EditActivityDialog";
import DeleteActivityDialog from "@/components/admin/DeleteActivityDialog";
import { Edit, Trash2 } from "lucide-react";

interface Activity {
  id: string;
  title: string;
  type: string;
  submitted_by: string;
  created_at: string;
  description?: string;
  facility?: string;
  duration?: number;
  date: string;
}

const Admin = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const { toast } = useToast();
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [deletingActivity, setDeletingActivity] = useState<any>(null);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching activities:', error);
        toast({
          title: "Error",
          description: "Failed to fetch activities",
          variant: "destructive",
        });
        return;
      }

      // Remove duplicates based on ID
      const uniqueActivities = data?.filter((activity, index, self) => 
        index === self.findIndex(a => a.id === activity.id)
      ) || [];

      setActivities(uniqueActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        title: "Error",
        description: "Failed to fetch activities",
        variant: "destructive",
      });
    }
  };

  const getUserDisplayName = (submittedBy: string) => {
    if (!submittedBy) return 'Unknown User';
    
    if (submittedBy.includes('@')) {
      const username = submittedBy.split('@')[0];
      return username.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    return submittedBy;
  };

  const getTypeColor = (type: string) => {
    const lowerType = type.toLowerCase();
    switch (lowerType) {
      case 'administrative': return 'bg-purple-100 text-purple-800';
      case 'meetings': return 'bg-blue-100 text-blue-800';
      case 'training': return 'bg-green-100 text-green-800';
      case 'documentation': return 'bg-yellow-100 text-yellow-800';
      case 'supervision': return 'bg-orange-100 text-orange-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEditActivity = (activity: any) => {
    setEditingActivity(activity);
  };

  const handleDeleteActivity = (activity: any) => {
    setDeletingActivity(activity);
  };

  const handleActivityUpdated = (updatedActivity: any) => {
    setActivities(prev => {
      const updatedList = prev.map(activity => 
        activity.id === updatedActivity.id ? updatedActivity : activity
      );
      // Remove duplicates again after update
      return updatedList.filter((activity, index, self) => 
        index === self.findIndex(a => a.id === activity.id)
      );
    });
    setEditingActivity(null);
  };

  const handleActivityDeleted = (deletedId: string) => {
    setActivities(prev => prev.filter(activity => activity.id !== deletedId));
    setDeletingActivity(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed header that should always be visible */}
      <div className="w-full bg-black shadow-lg">
        <CountyHeader />
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Report Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border shadow-lg">
            <h3 className="text-lg font-bold text-[#be2251] mb-2">Activity Report</h3>
            <p className="text-sm text-gray-600">Comprehensive activity tracking and analysis</p>
            <Button className="mt-4 bg-[#fd3572] hover:bg-[#be2251] text-white">Generate Report</Button>
          </div>

          <div className="bg-white rounded-xl p-6 border shadow-lg">
            <h3 className="text-lg font-bold text-[#be2251] mb-2">User Report</h3>
            <p className="text-sm text-gray-600">User engagement and performance metrics</p>
            <Button className="mt-4 bg-[#fd3572] hover:bg-[#be2251] text-white">Generate Report</Button>
          </div>

          <div className="bg-white rounded-xl p-6 border shadow-lg">
            <h3 className="text-lg font-bold text-[#be2251] mb-2">System Report</h3>
            <p className="text-sm text-gray-600">System usage and performance statistics</p>
            <Button className="mt-4 bg-[#fd3572] hover:bg-[#be2251] text-white">Generate Report</Button>
          </div>
        </div>
      
        {/* User Submitted Activities Section */}
        <div className="bg-white rounded-xl p-6 border shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-[#be2251] mb-2">User Submitted Activities</h3>
              <p className="text-sm text-gray-600">Real-time view of all activities submitted by users ({activities.length} total)</p>
            </div>
            <div className="flex gap-2">
              <Button className="bg-[#fd3572] hover:bg-[#be2251] text-white">
                Export PDF
              </Button>
              <Button className="bg-[#fd3572] hover:bg-[#be2251] text-white">
                Export Excel
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold text-gray-900">Date</TableHead>
                  <TableHead className="font-semibold text-gray-900">Facility</TableHead>
                  <TableHead className="font-semibold text-gray-900">Title</TableHead>
                  <TableHead className="font-semibold text-gray-900">Type</TableHead>
                  <TableHead className="font-semibold text-gray-900">Duration (min)</TableHead>
                  <TableHead className="font-semibold text-gray-900">Submitted By</TableHead>
                  <TableHead className="font-semibold text-gray-900">Submitted At</TableHead>
                  <TableHead className="text-center font-semibold text-gray-900">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity.id} className="hover:bg-gray-50">
                    <TableCell className="border-b">{new Date(activity.date).toLocaleDateString()}</TableCell>
                    <TableCell className="border-b">{activity.facility || 'HQ'}</TableCell>
                    <TableCell className="font-medium border-b">{activity.title}</TableCell>
                    <TableCell className="border-b">
                      <Badge className={getTypeColor(activity.type)}>
                        {activity.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="border-b">{activity.duration || '-'}</TableCell>
                    <TableCell className="border-b">{getUserDisplayName(activity.submitted_by)}</TableCell>
                    <TableCell className="border-b">{new Date(activity.created_at).toLocaleString()}</TableCell>
                    <TableCell className="border-b">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          onClick={() => handleEditActivity(activity)}
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 border-blue-300 text-blue-600 hover:bg-blue-50"
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          onClick={() => handleDeleteActivity(activity)}
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {activities.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No activities found</p>
            </div>
          )}
        </div>

        {/* Edit Activity Dialog */}
        {editingActivity && (
          <EditActivityDialog
            activity={editingActivity}
            open={!!editingActivity}
            onClose={() => setEditingActivity(null)}
            onActivityUpdated={handleActivityUpdated}
          />
        )}

        {/* Delete Activity Dialog */}
        {deletingActivity && (
          <DeleteActivityDialog
            activity={deletingActivity}
            open={!!deletingActivity}
            onClose={() => setDeletingActivity(null)}
            onActivityDeleted={handleActivityDeleted}
          />
        )}
      </div>
    </div>
  );
};

export default Admin;
