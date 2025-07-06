
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
      console.log('🔄 UserPermissions - Creating user with data:', { email, full_name, role });
      
      // Enhanced validation before making the call
      if (!email?.trim() || !full_name?.trim() || !role?.trim() || !password?.trim()) {
        toast({
          title: "Validation Error",
          description: "All fields are required. Please check your input.",
          variant: "destructive",
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address.",
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

      // Clean up input data before sending
      const cleanEmail = email.trim().toLowerCase();
      const cleanFullName = full_name.trim();
      const cleanRole = role.trim();
      
      console.log('📝 UserPermissions - Cleaned data:', { 
        email: cleanEmail, 
        full_name: cleanFullName, 
        role: cleanRole,
        password_length: password.length 
      });

      const { data, error } = await supabase.rpc("create_admin_user", {
        user_email: cleanEmail,
        user_password: password,
        user_full_name: cleanFullName,
        user_role: cleanRole,
      });

      if (error) {
        console.error('❌ UserPermissions - RPC Error:', error);
        let errorMessage = "Failed to create user. Please try again.";
        
        // Handle specific error cases
        if (error.message?.includes('duplicate') || error.message?.includes('already exists')) {
          errorMessage = "A user with this email already exists.";
        } else if (error.message?.includes('invalid') || error.message?.includes('format')) {
          errorMessage = "Invalid email format or data provided.";
        } else if (error.message?.includes('permission') || error.message?.includes('denied')) {
          errorMessage = "Permission denied. Please check your admin privileges.";
        } else if (error.message?.includes('gen_salt') || error.message?.includes('crypt')) {
          errorMessage = "Password encryption failed. Please try a different password.";
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        toast({
          title: "Failed to add user",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      console.log('✅ UserPermissions - RPC Response:', data);

      if (!data) {
        toast({
          title: "Failed to add user",
          description: "No response from server. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (!isCreateAdminUserResponse(data) || !data.success) {
        console.error('❌ UserPermissions - User creation failed:', data);
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

      console.log('✅ UserPermissions - User created successfully:', data);
      toast({
        title: "User created successfully!",
        description: `${cleanEmail} has been added and activated.`,
      });
      setShowAddUser(false);
      
      // Refresh the user list after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (err) {
      console.error('❌ UserPermissions - Unexpected error creating user:', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : "An unexpected error occurred. Please try again.";
        
      toast({
        title: "Unexpected Error",
        description: errorMessage,
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
