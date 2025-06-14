
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";

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

interface DeleteActivityDialogProps {
  activity: Activity;
  open: boolean;
  onClose: () => void;
  onActivityDeleted: (activityId: string) => void;
}

const DeleteActivityDialog: React.FC<DeleteActivityDialogProps> = ({
  activity,
  open,
  onClose,
  onActivityDeleted
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

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

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', activity.id);

      if (error) {
        console.error('Error deleting activity:', error);
        toast({
          title: "Error",
          description: "Failed to delete activity",
          variant: "destructive",
        });
        return;
      }

      console.log('Activity deleted successfully:', activity.id);
      toast({
        title: "Success",
        description: "Activity deleted successfully",
      });

      onActivityDeleted(activity.id);
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast({
        title: "Error",
        description: "Failed to delete activity",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-red-600 flex items-center gap-2">
            <AlertTriangle size={20} />
            Delete Activity
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800 mb-3">
              Are you sure you want to delete this activity? This action cannot be undone.
            </p>
            
            <div className="bg-white rounded-lg p-3 border">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-[#fd3572] text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {getUserDisplayName(activity.submitted_by).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-600">by {getUserDisplayName(activity.submitted_by)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Badge className={`${getTypeColor(activity.type)} text-xs`}>
                  {activity.type}
                </Badge>
                {activity.facility && (
                  <span>📍 {activity.facility}</span>
                )}
                {activity.duration && (
                  <span>{activity.duration}min</span>
                )}
                <span>{new Date(activity.date).toLocaleDateString()}</span>
              </div>
              
              {activity.description && (
                <p className="text-xs text-gray-600 mt-2 line-clamp-2">{activity.description}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? 'Deleting...' : 'Delete Activity'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteActivityDialog;
