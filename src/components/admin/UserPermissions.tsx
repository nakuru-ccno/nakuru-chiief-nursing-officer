
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
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const { toast } = useToast();

  const roles = [
    "System Administrator",
    "Nakuru County Chief Nursing Officer",
    "Nakuru County Deputy Chief Nursing Officer",
    "Chief Nurse Officer",
    "Nurse Officer",
    "Senior Nurse",
    "Staff Nurse",
  ];

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      setIsLoadingSettings(true);
      const { data, error } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'user_permissions')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching permissions:', error);
        return;
      }

      if (data?.setting_value) {
        setPermissions(data.setting_value as any);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          setting_key: 'user_permissions',
          setting_value: permissions,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving permissions:', error);
        toast({
          title: "Error",
          description: "Failed to save permissions. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "User permissions saved permanently",
      });
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast({
        title: "Error",
        description: "Failed to save permissions. Please try again.",
        variant: "destructive",
      });
    }
  };

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

      console.log('✅ User created successfully');
    } catch (err) {
      console.error('❌ Error creating user:', err);
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      });
    }
  };

  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-[#fd3572] border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-600">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <UserManagement />

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
        Save Permission Settings Permanently
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
