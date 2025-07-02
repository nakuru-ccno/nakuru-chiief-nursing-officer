
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AddUserForm from "./AddUserForm";

interface AddUserDialogProps {
  onAddUser: (userData: { full_name: string; email: string; role: string; password: string }) => void;
  onCancel: () => void;
  predefinedRoles: string[];
  isLoading?: boolean;
}

const AddUserDialog = ({ onAddUser, onCancel, predefinedRoles, isLoading = false }: AddUserDialogProps) => {
  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#be2251]">Add New User - Nakuru County</DialogTitle>
        </DialogHeader>
        
        <AddUserForm
          onSubmit={onAddUser}
          onCancel={onCancel}
          predefinedRoles={predefinedRoles}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
