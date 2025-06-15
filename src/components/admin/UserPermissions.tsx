
import React, { useState } from "react";
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

const predefinedRoles = [
  "Staff Nurse",
  "Charge Nurse",
  "Matron",
  "Chief Nurse Officer",
  "System Administrator",
];

const UserPermissions = () => {
  const [showAddUser, setShowAddUser] = useState(false);
  const [permissions, setPermissions] = useState({
    defaultRole: "Staff Nurse",
    allowSelfRegistration: false,
    requireApproval: true,
    allowRoleChange: false,
  });
  const { toast } = useToast();

  // Updated roles for Nakuru County
  const roles = [
    "System Administrator",
    "Nakuru County Chief Nursing Officer",
    "Nakuru County Deputy Chief Nursing Officer",
    "Chief Nurse Officer",
    "Nurse Officer",
    "Senior Nurse",
    "Staff Nurse",
  ];

  const handleSave = () => {
    localStorage.setItem("userPermissions", JSON.stringify(permissions));
    toast({
      title: "Success",
      description: "User permissions updated successfully",
    });
  };

  // Helper type guard for Supabase RPC return value
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
    const { data, error } = await supabase.rpc("create_admin_user", {
      user_email: email,
      user_password: password,
      user_full_name: full_name,
      user_role: role,
    });

    if (
      error ||
      !isCreateAdminUserResponse(data) ||
      !data.success
    ) {
      toast({
        title: "Failed to add user",
        description:
          error?.message ||
          (isCreateAdminUserResponse(data) ? data.error : undefined) ||
          "Unknown error creating user.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "User created",
      description: `${email} successfully added and activated.`,
    });
    setShowAddUser(false);

    // Optionally, refresh the user list here if needed
    // await fetchUsers();
  };

  return (
    <div>
      {/* User Management Section */}
      <UserManagement />

      {/* Permission Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#be2251]">Default User Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="defaultRole">Default role for new users</Label>
            <Select
              value={permissions.defaultRole}
              onValueChange={(value) =>
                setPermissions((prev) => ({ ...prev, defaultRole: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#be2251]">Registration Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="allowSelfRegistration"
              checked={permissions.allowSelfRegistration}
              onCheckedChange={(checked) =>
                setPermissions((prev) => ({
                  ...prev,
                  allowSelfRegistration: checked,
                }))
              }
            />
            <Label htmlFor="allowSelfRegistration">
              Allow self-registration
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="requireApproval"
              checked={permissions.requireApproval}
              onCheckedChange={(checked) =>
                setPermissions((prev) => ({
                  ...prev,
                  requireApproval: checked,
                }))
              }
            />
            <Label htmlFor="requireApproval">
              Require admin approval for new accounts
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="allowRoleChange"
              checked={permissions.allowRoleChange}
              onCheckedChange={(checked) =>
                setPermissions((prev) => ({
                  ...prev,
                  allowRoleChange: checked,
                }))
              }
            />
            <Label htmlFor="allowRoleChange">
              Allow users to request role changes
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#be2251]">
            Nakuru County Role Hierarchy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {roles.map((role, index) => (
              <div
                key={role}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <span className="font-medium">{role}</span>
                <Badge variant="outline">Level {roles.length - index}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        className="w-full bg-[#fd3572] hover:bg-[#be2251] text-white"
      >
        Save Permission Settings
      </Button>

      <button
        className="bg-[#fd3572] hover:bg-[#be2251] text-white px-4 py-2 rounded font-semibold my-4"
        onClick={() => setShowAddUser(true)}
      >
        Add User
      </button>
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
