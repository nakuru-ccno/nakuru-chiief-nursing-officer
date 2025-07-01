import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, Archive, Trash2, UserX, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

const DataManagement = () => {
  const [settings, setSettings] = useState({
    retentionPeriod: "365",
    autoBackup: true,
    backupFrequency: "daily",
    exportFormat: "xlsx"
  });
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  useEffect(() => {
    fetchUsers();
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

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .eq('status', 'active')
        .order('email');

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleClearUserData = async () => {
    if (!selectedUser) return;

    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('submitted_by', selectedUser.email);

      if (error) {
        console.error('Error clearing user data:', error);
        toast({
          title: "Error",
          description: "Failed to clear user data. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `All activity data for ${selectedUser.email} has been cleared.`,
      });

      setShowClearDialog(false);
      setSelectedUser(null);
      setSearchTerm("");
    } catch (error) {
      console.error('Error clearing user data:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    searchTerm === "" || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to save settings.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          setting_key: 'data_retention',
          setting_value: settings,
          updated_by: user.id,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving settings:', error);
        toast({
          title: "Error",
          description: "Failed to save settings. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Data management settings saved successfully"
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Data export has been initiated. You'll receive a download link shortly."
    });
  };

  const handleBackupNow = () => {
    toast({
      title: "Backup Started",  
      description: "Manual backup has been initiated successfully."
    });
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
      {/* Simplified User Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#be2251] flex items-center gap-2">
            <UserX className="w-5 h-5" />
            Individual User Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="userSearch">Search User</Label>
            <div className="flex gap-2 mt-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="userSearch"
                  placeholder="Type name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {searchTerm && (
            <div className="border rounded-lg max-h-64 overflow-y-auto">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`p-3 hover:bg-gray-50 border-b last:border-b-0 cursor-pointer ${
                      selectedUser?.id === user.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="font-medium">{user.full_name || user.email}</div>
                    <div className="text-sm text-gray-500">
                      {user.email} • {user.role}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-gray-500 text-center">No users found</div>
              )}
            </div>
          )}

          {selectedUser && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="mb-3">
                <h4 className="font-medium text-blue-900">Selected User:</h4>
                <p className="text-sm text-blue-700">{selectedUser.full_name || selectedUser.email}</p>
                <p className="text-sm text-blue-600">{selectedUser.email} • {selectedUser.role}</p>
              </div>
              <Button
                onClick={() => setShowClearDialog(true)}
                variant="destructive"
                className="w-full"
                disabled={isLoading}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Data for This User
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Retention */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#be2251]">Data Retention</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="retentionPeriod">Data retention period (days)</Label>
            <Select value={settings.retentionPeriod} onValueChange={(value) => setSettings(prev => ({ ...prev, retentionPeriod: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="180">6 months</SelectItem>
                <SelectItem value="365">1 year</SelectItem>
                <SelectItem value="1095">3 years</SelectItem>
                <SelectItem value="-1">Never delete</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Backup Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#be2251]">Backup Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="autoBackup"
              checked={settings.autoBackup}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoBackup: checked }))}
            />
            <Label htmlFor="autoBackup">Enable automatic backups</Label>
          </div>

          <div>
            <Label htmlFor="backupFrequency">Backup frequency</Label>
            <Select value={settings.backupFrequency} onValueChange={(value) => setSettings(prev => ({ ...prev, backupFrequency: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Every hour</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleBackupNow} variant="outline" className="w-full flex items-center gap-2">
            <Archive size={16} />
            Create Backup Now
          </Button>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#be2251]">Data Export</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="exportFormat">Export format</Label>
            <Select value={settings.exportFormat} onValueChange={(value) => setSettings(prev => ({ ...prev, exportFormat: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                <SelectItem value="csv">CSV (.csv)</SelectItem>
                <SelectItem value="json">JSON (.json)</SelectItem>
                <SelectItem value="pdf">PDF Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button onClick={handleExportData} className="bg-[#fd3572] hover:bg-[#be2251] text-white flex items-center gap-2">
              <Download size={16} />
              Export All Data
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Upload size={16} />
              Import Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#be2251] text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" className="w-full flex items-center gap-2">
            <Trash2 size={16} />
            Purge Old Data
          </Button>
          <p className="text-sm text-gray-600 mt-2">
            This will permanently delete data older than the retention period.
          </p>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button onClick={handleSave} className="w-full bg-[#fd3572] hover:bg-[#be2251] text-white">
        Save Data Settings Permanently
      </Button>

      {/* Clear User Data Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Clear User Data</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Are you sure you want to permanently delete ALL activity data for this user?</p>
              {selectedUser && (
                <div className="bg-gray-50 p-3 rounded-md space-y-1">
                  <p><strong>Name:</strong> {selectedUser.full_name || 'Not set'}</p>
                  <p><strong>Email:</strong> {selectedUser.email}</p>
                  <p><strong>Role:</strong> {selectedUser.role}</p>
                </div>
              )}
              <p className="text-red-600 font-medium">
                This action cannot be undone. All activities logged by this user will be permanently deleted.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearUserData}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Clearing..." : "Clear All User Data"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DataManagement;
