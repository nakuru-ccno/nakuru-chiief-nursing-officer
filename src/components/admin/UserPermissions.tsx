
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import AddUserDialog from "./AddUserDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import UserManagement from "./UserManagement";
import PermissionSettings from "./PermissionSettings";
import RoleHierarchy from "./RoleHierarchy";

// Type for the create_admin_user response
interface CreateAdminUserResponse {
  success: boolean;
  error?: string;
  user_id?: string;
  email?: string;
}

const UserPermissions = () => {
  const [showAddUser, setShowAddUser] = useState(false);
  const { toast } = useToast();

  const predefinedRoles = [
    "Staff Nurse",
    "Charge Nurse", 
    "Matron",
    "Chief Nurse Officer",
    "System Administrator",
  ];

  function isCreateAdminUserResponse(
    data: any
  ): data is CreateAdminUserResponse {
    return typeof data === "object" && data !== null && "success" in data;
  }

  const handleAddUser = async ({
    full_name,
    email,
    role,
    password,
  }: {
    full_name: string;
    email: string;
    role: string;
    password: string;
  }) => {
    try {
      console.log('🔄 Creating user with improved error handling:', { email, full_name, role });
      
      // Validate inputs before making the call
      if (!email?.trim() || !full_name?.trim() || !role?.trim() || !password?.trim()) {
        toast({
          title: "Validation Error",
          description: "All fields are required. Please check your input.",
          variant: "destructive",
        });
        return;
      }

      // Ensure password is strong enough
      if (password.length < 8) {
        toast({
          title: "Password Error",
          description: "Password must be at least 8 characters long.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.rpc("create_admin_user", {
        user_email: email.trim().toLowerCase(),
        user_password: password,
        user_full_name: full_name.trim(),
        user_role: role.trim(),
      });

      if (error) {
        console.error('❌ RPC Error:', error);
        let errorMessage = "Failed to create user. Please try again.";
        
        if (error.message.includes('duplicate')) {
          errorMessage = "A user with this email already exists.";
        } else if (error.message.includes('invalid')) {
          errorMessage = "Invalid email format or password.";
        } else if (error.message.includes('gen_salt')) {
          errorMessage = "Password encryption failed. Please try a different password.";
        }
        
        toast({
          title: "Failed to add user",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      console.log('✅ RPC Response:', data);

      if (!data) {
        toast({
          title: "Failed to add user",
          description: "No response from server. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (!isCreateAdminUserResponse(data) || !data.success) {
        console.error('❌ User creation failed:', data);
        const errorMessage = isCreateAdminUserResponse(data) 
          ? data.error || "Unknown error creating user."
          : "Unexpected response format from server.";
        
        toast({
          title: "Failed to add user",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      console.log('✅ User created successfully:', data);
      toast({
        title: "User created successfully!",
        description: `${email} has been added and activated.`,
      });
      setShowAddUser(false);
      
      // Refresh the user list
      window.location.reload();
    } catch (err) {
      console.error('❌ Unexpected error creating user:', err);
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <UserManagement />
      <PermissionSettings />
      <RoleHierarchy />

      <Button
        onClick={() => setShowAddUser(true)}
        className="bg-[#fd3572] hover:bg-[#be2251] text-white px-6 py-3 rounded-lg font-semibold"
      >
        Add New User
      </Button>

      {showAddUser && (
        <AddUserDialog
          onAddUser={handleAddUser}
          onCancel={() => setShowAddUser(false)}
          predefinedRoles={predefinedRoles}
        />
      )}
    </div>
  );
};

export default UserPermissions;
