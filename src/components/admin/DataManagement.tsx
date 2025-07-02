import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Download, Trash2, Search, UserX, FileText, Database, HardDrive, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
  created_at: string;
}

interface Activity {
  id: string;
  title: string;
  type: string;
  date: string;
  submitted_by: string;
  created_at: string;
}

const DataManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [settings, setSettings] = useState({
    retentionPeriod: "365",
    autoBackup: true,
    backupFrequency: "daily",
    exportFormat: "xlsx",
  });
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchActivities();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoadingSettings(true);
      const { data, error } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'data_retention')
        .maybeSingle();

      if (error) {
        console.error('Error fetching settings:', error);
        toast({
          title: "Error",
          description: "Failed to load settings. Using defaults.",
          variant: "destructive",
        });
        return;
      }

      if (data?.setting_value) {
        setSettings(data.setting_value as any);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings. Using defaults.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSavingSettings(true);
      console.log('💾 Saving data management settings...', settings);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to save settings.",
          variant: "destructive",
        });
        return;
      }

      // First, try to update existing record
      const { data: updateData, error: updateError } = await supabase
        .from('admin_settings')
        .update({
          setting_value: settings,
          updated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', 'data_retention')
        .select();

      if (updateError) {
        console.error('Error updating settings:', updateError);
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
            setting_key: 'data_retention',
            setting_value: settings,
            updated_by: user.id,
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error inserting settings:', insertError);
          toast({
            title: "Error",
            description: `Failed to save settings: ${insertError.message}`,
            variant: "destructive",
          });
          return;
        }
      }

      toast({
        title: "Success",
        description: "Data management settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive",
        });
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchActivities = async () => {
    try {
      setIsLoadingActivities(true);
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching activities:', error);
        toast({
          title: "Error",
          description: "Failed to load activities",
          variant: "destructive",
        });
        return;
      }

      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        title: "Error",
        description: "Failed to load activities",
        variant: "destructive",
      });
    } finally {
      setIsLoadingActivities(false);
    }
  };

  const exportData = async (type: 'users' | 'activities') => {
    try {
      const data = type === 'users' ? users : activities;
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, type);
      
      const fileName = `${type}_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      toast({
        title: "Success",
        description: `${type} data exported successfully`,
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Error deleting user:', error);
        toast({
          title: "Error",
          description: "Failed to delete user",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      {/* Data Retention Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#be2251] flex items-center gap-2">
            <Database className="w-5 h-5" />
            Data Retention Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="retention">Data retention period (days)</Label>
              <Input
                id="retention"
                type="number"
                value={settings.retentionPeriod}
                onChange={(e) => setSettings(prev => ({ ...prev, retentionPeriod: e.target.value }))}
                placeholder="365"
              />
            </div>
            <div>
              <Label htmlFor="exportFormat">Export format</Label>
              <Select
                value={settings.exportFormat}
                onValueChange={(value) => setSettings(prev => ({ ...prev, exportFormat: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                  <SelectItem value="json">JSON (.json)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="autoBackup"
                checked={settings.autoBackup}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoBackup: checked }))}
              />
              <Label htmlFor="autoBackup">Enable automatic backups</Label>
            </div>
            
            {settings.autoBackup && (
              <div>
                <Label htmlFor="backupFreq">Backup frequency</Label>
                <Select
                  value={settings.backupFrequency}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, backupFrequency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Button 
            onClick={saveSettings}
            disabled={isSavingSettings}
            className="w-full bg-[#fd3572] hover:bg-[#be2251] text-white"
          >
            {isSavingSettings ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving Settings...
              </div>
            ) : (
              "Save Data Retention Settings"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#be2251] flex items-center gap-2">
            <Search className="w-5 h-5" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search users by name, email, or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button
                onClick={() => exportData('users')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Users
              </Button>
            </div>

            {isLoadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-4 border-[#fd3572] border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-600">Loading users...</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{user.full_name}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                      <div className="text-xs text-gray-500">Role: {user.role} | Status: {user.status}</div>
                    </div>
                    <Button
                      onClick={() => deleteUser(user.id)}
                      variant="destructive"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <UserX className="w-3 h-3" />
                      Delete
                    </Button>
                  </div>
                ))}
                {filteredUsers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No users found matching your search.
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activity Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#be2251] flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Activity Data Export
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700">Export all activity data</p>
              <p className="text-sm text-gray-500">
                Total activities: {activities.length}
              </p>
            </div>
            <Button
              onClick={() => exportData('activities')}
              className="bg-[#fd3572] hover:bg-[#be2251] text-white flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Activities
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataManagement;
