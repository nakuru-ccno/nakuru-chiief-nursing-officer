
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const DashboardSettings = () => {
  const [settings, setSettings] = useState({
    refreshInterval: "15",
    autoRefresh: true,
    showLiveStats: true,
    showSystemLoad: true,
    maxActivitiesDisplay: "50"
  });
  const { toast } = useToast();

  const handleSave = () => {
    // Save settings to localStorage for now
    localStorage.setItem("dashboardSettings", JSON.stringify(settings));
    toast({
      title: "Success",
      description: "Dashboard settings saved successfully"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-[#be2251]">Refresh Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="refreshInterval">Auto-refresh interval (seconds)</Label>
            <Select value={settings.refreshInterval} onValueChange={(value) => setSettings(prev => ({ ...prev, refreshInterval: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 seconds</SelectItem>
                <SelectItem value="10">10 seconds</SelectItem>
                <SelectItem value="15">15 seconds</SelectItem>
                <SelectItem value="30">30 seconds</SelectItem>
                <SelectItem value="60">1 minute</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="autoRefresh"
              checked={settings.autoRefresh}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoRefresh: checked }))}
            />
            <Label htmlFor="autoRefresh">Enable auto-refresh</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#be2251]">Display Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="showLiveStats"
              checked={settings.showLiveStats}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showLiveStats: checked }))}
            />
            <Label htmlFor="showLiveStats">Show live statistics</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="showSystemLoad"
              checked={settings.showSystemLoad}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showSystemLoad: checked }))}
            />
            <Label htmlFor="showSystemLoad">Show system load monitor</Label>
          </div>

          <div>
            <Label htmlFor="maxActivities">Maximum activities to display</Label>
            <Input
              id="maxActivities"
              type="number"
              value={settings.maxActivitiesDisplay}
              onChange={(e) => setSettings(prev => ({ ...prev, maxActivitiesDisplay: e.target.value }))}
              min="10"
              max="200"
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full bg-[#fd3572] hover:bg-[#be2251] text-white">
        Save Dashboard Settings
      </Button>
    </div>
  );
};

export default DashboardSettings;
