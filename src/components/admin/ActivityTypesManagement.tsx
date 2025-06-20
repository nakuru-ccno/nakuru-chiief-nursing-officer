
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Tags, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ActivityType {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

const ActivityTypesManagement = () => {
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingType, setEditingType] = useState<ActivityType | null>(null);
  const [deletingType, setDeletingType] = useState<ActivityType | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchActivityTypes();
  }, []);

  const fetchActivityTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_types')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching activity types:', error);
        toast({
          title: "Error",
          description: "Failed to load activity types",
          variant: "destructive",
        });
        return;
      }

      setActivityTypes(data || []);
    } catch (error) {
      console.error('Error fetching activity types:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveType = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Activity type name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingType) {
        // Update existing type
        const { error } = await supabase
          .from('activity_types')
          .update({
            name: formData.name.trim(),
            description: formData.description.trim(),
            is_active: formData.is_active,
          })
          .eq('id', editingType.id);

        if (error) {
          console.error('Error updating activity type:', error);
          toast({
            title: "Error",
            description: "Failed to update activity type",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Success",
          description: "Activity type updated successfully",
        });
      } else {
        // Create new type
        const { error } = await supabase
          .from('activity_types')
          .insert({
            name: formData.name.trim(),
            description: formData.description.trim(),
            is_active: formData.is_active,
          });

        if (error) {
          console.error('Error creating activity type:', error);
          toast({
            title: "Error",
            description: "Failed to create activity type",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Success",
          description: "Activity type created successfully",
        });
      }

      // Reset form and refresh data
      setFormData({ name: "", description: "", is_active: true });
      setEditingType(null);
      setShowAddForm(false);
      fetchActivityTypes();
    } catch (error) {
      console.error('Error saving activity type:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleEditType = (type: ActivityType) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      description: type.description || "",
      is_active: type.is_active,
    });
    setShowAddForm(true);
  };

  const handleDeleteType = async () => {
    if (!deletingType) return;

    try {
      const { error } = await supabase
        .from('activity_types')
        .delete()
        .eq('id', deletingType.id);

      if (error) {
        console.error('Error deleting activity type:', error);
        toast({
          title: "Error",
          description: "Failed to delete activity type",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Activity type deleted successfully",
      });

      setDeletingType(null);
      fetchActivityTypes();
    } catch (error) {
      console.error('Error deleting activity type:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", description: "", is_active: true });
    setEditingType(null);
    setShowAddForm(false);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p>Loading activity types...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-600 flex items-center gap-2">
              <Tags className="w-5 h-5" />
              {editingType ? 'Edit Activity Type' : 'Add New Activity Type'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="typeName">Activity Type Name</Label>
              <Input
                id="typeName"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Training, Meetings, etc."
              />
            </div>
            
            <div>
              <Label htmlFor="typeDescription">Description</Label>
              <Textarea
                id="typeDescription"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this activity type..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="isActive">Active (available for selection)</Label>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveType} className="bg-orange-600 hover:bg-orange-700">
                <Save className="w-4 h-4 mr-2" />
                {editingType ? 'Update' : 'Create'} Type
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Types List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-orange-600 flex items-center gap-2">
              <Tags className="w-5 h-5" />
              Activity Types ({activityTypes.length})
            </CardTitle>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Type
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activityTypes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activityTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell className="font-medium">{type.name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {type.description || 'No description'}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        type.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {type.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(type.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditType(type)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeletingType(type)}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Tags className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No activity types found</p>
              <Button 
                className="mt-4 bg-orange-600 hover:bg-orange-700"
                onClick={() => setShowAddForm(true)}
              >
                Add First Activity Type
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingType} onOpenChange={() => setDeletingType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Delete Activity Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the activity type "{deletingType?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteType}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ActivityTypesManagement;
