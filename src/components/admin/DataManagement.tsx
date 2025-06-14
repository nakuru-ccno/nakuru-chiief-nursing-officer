
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, Archive, Trash2 } from "lucide-react";

const DataManagement = () => {
  const [settings, setSettings] = useState({
    retentionPeriod: "365",
    autoBackup: true,
    backupFrequency: "daily",
    exportFormat: "xlsx"
  });
  const { toast } = useToast();

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

      <Button onClick={handleSave} className="w-full bg-[#fd3572] hover:bg-[#be2251] text-white">
        Save Data Settings
      </Button>
    </div>
  );
};

export default DataManagement;
