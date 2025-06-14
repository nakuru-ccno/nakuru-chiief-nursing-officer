
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

interface EditActivityDialogProps {
  activity: Activity;
  open: boolean;
  onClose: () => void;
  onActivityUpdated: (activity: Activity) => void;
}

const EditActivityDialog: React.FC<EditActivityDialogProps> = ({
  activity,
  open,
  onClose,
  onActivityUpdated
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: activity.title,
    type: activity.type,
    description: activity.description || '',
    facility: activity.facility || 'HQ',
    duration: activity.duration || 0,
    date: activity.date
  });

  const activityTypes = [
    'Administrative',
    'Meetings',
    'Training',
    'Documentation',
    'Supervision',
    'General'
  ];

  const facilities = [
    'HQ',
    'Branch Office A',
    'Branch Office B',
    'Remote',
    'Field Office'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('activities')
        .update({
          title: formData.title,
          type: formData.type,
          description: formData.description,
          facility: formData.facility,
          duration: formData.duration,
          date: formData.date
        })
        .eq('id', activity.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating activity:', error);
        toast({
          title: "Error",
          description: "Failed to update activity",
          variant: "destructive",
        });
        return;
      }

      console.log('Activity updated successfully:', data);
      toast({
        title: "Success",
        description: "Activity updated successfully",
      });

      onActivityUpdated(data as Activity);
    } catch (error) {
      console.error('Error updating activity:', error);
      toast({
        title: "Error",
        description: "Failed to update activity",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-[#be2251]">
            Edit Activity
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Activity Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter activity title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Activity Type</Label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select activity type" />
              </SelectTrigger>
              <SelectContent>
                {activityTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="facility">Facility</Label>
            <Select value={formData.facility} onValueChange={(value) => handleInputChange('facility', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select facility" />
              </SelectTrigger>
              <SelectContent>
                {facilities.map((facility) => (
                  <SelectItem key={facility} value={facility}>
                    {facility}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={formData.duration}
              onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
              placeholder="Duration in minutes"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter activity description"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-[#fd3572] to-[#be2251] hover:from-[#be2251] hover:to-[#fd3572] text-white"
            >
              {isLoading ? 'Updating...' : 'Update Activity'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditActivityDialog;
