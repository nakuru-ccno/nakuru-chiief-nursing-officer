
import React from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
  created_at: string;
  last_sign_in_at: string;
  email_verified: boolean;
}

interface DeleteUserDialogProps {
  user: UserProfile;
  open: boolean;
  onClose: () => void;
  onUserDeleted: (deletedId: string) => void;
}

const DeleteUserDialog = ({ user, open, onClose, onUserDeleted }: DeleteUserDialogProps) => {
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      console.log('🗑️ Deleting user:', user.email);
      
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (error) {
        console.error('❌ Error deleting user:', error);
        toast({
          title: "Error",
          description: "Failed to delete user",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ User deleted successfully');
      onUserDeleted(user.id);
    } catch (error) {
      console.error('❌ Error in handleDelete:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600">Delete User</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>Are you sure you want to permanently delete this user?</p>
            <div className="bg-gray-50 p-3 rounded-md space-y-1">
              <p><strong>Name:</strong> {user.full_name || user.email}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
            </div>
            <p className="text-red-600 font-medium">
              This action cannot be undone. The user will be completely removed from the system.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete User
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteUserDialog;
