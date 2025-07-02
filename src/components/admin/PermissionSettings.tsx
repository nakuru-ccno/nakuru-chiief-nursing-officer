
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PermissionSettings = () => {
  const [permissions, setPermissions] = useState({
    defaultRole: "Staff Nurse",
    allowSelfRegistration: false,
    requireApproval: true,
    allowRoleChange: false,
  });
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
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
      console.log('🔄 Fetching admin settings...');
      
      const { data, error } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'user_permissions')
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching permissions:', error);
        toast({
          title: "Warning",
          description: "Failed to load saved settings. Using defaults.",
          variant: "destructive",
        });
        return;
      }

      if (data?.setting_value) {
        console.log('✅ Loaded saved permissions:', data.setting_value);
        setPermissions(data.setting_value as any);
      } else {
        console.log('⚠️ No saved permissions found, using defaults');
      }
    } catch (error) {
      console.error('❌ Error fetching permissions:', error);
      toast({
        title: "Warning", 
        description: "Failed to load saved settings. Using defaults.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSavingSettings(true);
      console.log('💾 Saving permission settings...', permissions);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to save settings.",
          variant: "destructive",
        });
        return;
      }

      console.log('👤 Current user:', user.email);

      // Check if user has admin role from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      console.log('🔒 User profile role:', profile?.role);

      if (!profile || !['admin', 'System Administrator'].includes(profile.role || '')) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to save settings.",
          variant: "destructive",
        });
        return;
      }

      // First, try to update existing record
      const { data: updateData, error: updateError } = await supabase
        .from('admin_settings')
        .update({
          setting_value: permissions,
          updated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', 'user_permissions')
        .select();

      if (updateError) {
        console.error('❌ Error updating permissions:', updateError);
        toast({
          title: "Error",
          description: `Failed to save settings: ${updateError.message}`,
          variant: "destructive",
        });
        return;
      }

      // If no rows were updated, insert a new record
      if (!updateData || updateData.length === 0) {
        console.log('📝 No existing record found, inserting new one...');
        const { error: insertError } = await supabase
          .from('admin_settings')
          .insert({
            setting_key: 'user_permissions',
            setting_value: permissions,
            updated_by: user.id,
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('❌ Error inserting permissions:', insertError);
          toast({
            title: "Error",
            description: `Failed to save settings: ${insertError.message}`,
            variant: "destructive",
          });
          return;
        }
      }

      console.log('✅ Settings saved successfully');
      toast({
        title: "Success",
        description: "User permissions saved successfully",
      });
    } catch (error) {
      console.error('❌ Error saving permissions:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingSettings(false);
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
              <SelectTrigger className="bg-white border border-gray-200 shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                {roles.map((role) => (
                  <SelectItem key={role} value={role} className="cursor-pointer hover:bg-gray-50">
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

      <Button
        onClick={handleSave}
        disabled={isSavingSettings}
        className="w-full bg-[#fd3572] hover:bg-[#be2251] text-white"
      >
        {isSavingSettings ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Saving Settings...
          </div>
        ) : (
          "Save Permission Settings"
        )}
      </Button>
    </div>
  );
};

export default PermissionSettings;
