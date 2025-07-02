
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
  ): data is { success: boolean; error?: string } {
    return typeof data === "object" && !!data && "success" in data;
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
      console.log('🔄 Creating user:', { email, full_name, role });
      
      const { data, error } = await supabase.rpc("create_admin_user", {
        user_email: email,
        user_password: password,
        user_full_name: full_name,
        user_role: role,
      });

      if (error || !isCreateAdminUserResponse(data) || !data.success) {
        console.error('❌ Error creating user:', error || data?.error);
        toast({
          title: "Failed to add user",
          description: error?.message || (isCreateAdminUserResponse(data) ? data.error : undefined) || "Unknown error creating user.",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ User created successfully:', data);
      toast({
        title: "User created",
        description: `${email} successfully added and activated.`,
      });
      setShowAddUser(false);
    } catch (err) {
      console.error('❌ Error creating user:', err);
      toast({
        title: "Error",
        description: "Failed to create user",
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
