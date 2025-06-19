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
  const [searchEmail, setSearchEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

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
      
      // Delete all activities for the selected user
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
      setSearchEmail("");
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
    user.email.toLowerCase().includes(searchEmail.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchEmail.toLowerCase())
  );

  const handleSave = () => {
    localStorage.setItem("dataSettings", JSON.stringify(settings));
    toast({
      title: "Success",
      description: "Data management settings saved successfully"
    });
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

  return (
    <div className="space-y-6">
      {/* User Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#be2251] flex items-center gap-2">
            <UserX className="w-5 h-5" />
            Individual User Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="userSearch">Search User by Email or Name</Label>
            <div className="flex gap-2 mt-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="userSearch"
                  placeholder="Enter email or name..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {searchEmail && filteredUsers.length > 0 && (
            <div className="border rounded-lg max-h-48 overflow-y-auto">
              {filteredUsers.slice(0, 10).map((user) => (
                <div
                  key={user.id}
                  className="p-3 hover:bg-gray-50 border-b last:border-b-0 cursor-pointer"
                  onClick={() => {
                    setSelectedUser(user);
                    setSearchEmail(user.email);
                  }}
                >
                  <div className="font-medium">{user.email}</div>
                  <div className="text-sm text-gray-500">
                    {user.full_name} - {user.role}
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedUser && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="mb-3">
                <h4 className="font-medium">Selected User:</h4>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
                <p className="text-sm text-gray-600">{selectedUser.full_name} - {selectedUser.role}</p>
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
        Save Data Settings
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
                  <p><strong>Email:</strong> {selectedUser.email}</p>
                  <p><strong>Name:</strong> {selectedUser.full_name}</p>
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
