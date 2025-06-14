
import React, { useState, useEffect } from "react";
import CountyHeader from "@/components/CountyHeader";
import MainNavbar from "@/components/MainNavbar";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EditActivityDialog from "@/components/admin/EditActivityDialog";
import DeleteActivityDialog from "@/components/admin/DeleteActivityDialog";
import { 
  Edit, 
  Trash2, 
  Users, 
  Activity, 
  FileText, 
  Settings,
  BarChart3,
  Clock,
  TrendingUp,
  Shield
} from "lucide-react";

interface Activity {
  id: string;
  title: string;
  type: string;
  submitted_by: string;
  created_at: string;
  description?: string;
  facility?: string;
  duration?: number;
  date: string;
}

const Admin = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeSection, setActiveSection] = useState("dashboard");
  const { toast } = useToast();
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [deletingActivity, setDeletingActivity] = useState<any>(null);
  const [stats, setStats] = useState({
    totalActivities: 0,
    totalUsers: 0,
    thisMonth: 0,
    avgDuration: 0
  });

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching activities:', error);
        toast({
          title: "Error",
          description: "Failed to fetch activities",
          variant: "destructive",
        });
        return;
      }

      const uniqueActivities = data?.filter((activity, index, self) => 
        index === self.findIndex(a => a.id === activity.id)
      ) || [];

      setActivities(uniqueActivities);

      // Calculate stats
      const totalActivities = uniqueActivities.length;
      const uniqueUsers = new Set(uniqueActivities.map(a => a.submitted_by)).size;
      
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const thisMonthActivities = uniqueActivities.filter(activity => {
        const activityDate = new Date(activity.date);
        return activityDate >= thisMonth;
      }).length;

      const totalMinutes = uniqueActivities.reduce((sum, activity) => sum + (activity.duration || 0), 0);
      const avgDuration = totalActivities > 0 ? Math.round(totalMinutes / totalActivities) : 0;

      setStats({
        totalActivities,
        totalUsers: uniqueUsers,
        thisMonth: thisMonthActivities,
        avgDuration
      });

    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        title: "Error",
        description: "Failed to fetch activities",
        variant: "destructive",
      });
    }
  };

  const adminSections = [
    { id: "dashboard", label: "Dashboard Overview", icon: BarChart3 },
    { id: "activities", label: "Manage Activities", icon: Activity },
    { id: "reports", label: "Generate Reports", icon: FileText },
    { id: "settings", label: "System Settings", icon: Settings },
  ];

  const getUserDisplayName = (submittedBy: string) => {
    if (!submittedBy) return 'Unknown User';
    
    if (submittedBy.includes('@')) {
      const username = submittedBy.split('@')[0];
      return username.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    return submittedBy;
  };

  const getTypeColor = (type: string) => {
    const lowerType = type.toLowerCase();
    switch (lowerType) {
      case 'administrative': return 'bg-purple-100 text-purple-800';
      case 'meetings': return 'bg-blue-100 text-blue-800';
      case 'training': return 'bg-green-100 text-green-800';
      case 'documentation': return 'bg-yellow-100 text-yellow-800';
      case 'supervision': return 'bg-orange-100 text-orange-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEditActivity = (activity: any) => {
    setEditingActivity(activity);
  };

  const handleDeleteActivity = (activity: any) => {
    setDeletingActivity(activity);
  };

  const handleActivityUpdated = (updatedActivity: any) => {
    setActivities(prev => {
      const updatedList = prev.map(activity => 
        activity.id === updatedActivity.id ? updatedActivity : activity
      );
      return updatedList.filter((activity, index, self) => 
        index === self.findIndex(a => a.id === activity.id)
      );
    });
    setEditingActivity(null);
  };

  const handleActivityDeleted = (deletedId: string) => {
    setActivities(prev => prev.filter(activity => activity.id !== deletedId));
    setDeletingActivity(null);
  };

  const renderDashboardOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-[#be2251] flex items-center gap-2">
              <Activity size={20} />
              Total Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#fd3572]">{stats.totalActivities}</div>
            <p className="text-sm text-gray-600">All time activities</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-[#be2251] flex items-center gap-2">
              <Users size={20} />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#fd3572]">{stats.totalUsers}</div>
            <p className="text-sm text-gray-600">Registered users</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-[#be2251] flex items-center gap-2">
              <TrendingUp size={20} />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#fd3572]">{stats.thisMonth}</div>
            <p className="text-sm text-gray-600">Activities this month</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-[#be2251] flex items-center gap-2">
              <Clock size={20} />
              Avg Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#fd3572]">{stats.avgDuration}</div>
            <p className="text-sm text-gray-600">Minutes per activity</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-[#fd3572]" 
              onClick={() => setActiveSection("activities")}>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-[#be2251] flex items-center gap-3">
              <Activity className="text-[#fd3572]" size={24} />
              Manage Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">View, edit, and manage all user activities</p>
            <Button className="w-full bg-gradient-to-r from-[#fd3572] to-[#be2251] hover:from-[#be2251] hover:to-[#fd3572] text-white">
              View Activities ({stats.totalActivities})
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-[#fd3572]" 
              onClick={() => setActiveSection("reports")}>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-[#be2251] flex items-center gap-3">
              <FileText className="text-[#fd3572]" size={24} />
              Generate Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Create comprehensive activity and user reports</p>
            <Button variant="outline" className="w-full border-[#fd3572] text-[#fd3572] hover:bg-[#fd3572] hover:text-white">
              Create Report
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-[#fd3572]" 
              onClick={() => setActiveSection("settings")}>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-[#be2251] flex items-center gap-3">
              <Settings className="text-[#fd3572]" size={24} />
              System Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Configure system settings and preferences</p>
            <Button variant="outline" className="w-full border-[#fd3572] text-[#fd3572] hover:bg-[#fd3572] hover:text-white">
              Open Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderActivitiesSection = () => (
    <div className="bg-white rounded-xl p-6 border shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-[#be2251] mb-2">User Submitted Activities</h3>
          <p className="text-sm text-gray-600">Real-time view of all activities submitted by users ({activities.length} total)</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-[#fd3572] hover:bg-[#be2251] text-white">
            Export PDF
          </Button>
          <Button className="bg-[#fd3572] hover:bg-[#be2251] text-white">
            Export Excel
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-semibold text-gray-900">Date</TableHead>
              <TableHead className="font-semibold text-gray-900">Facility</TableHead>
              <TableHead className="font-semibold text-gray-900">Title</TableHead>
              <TableHead className="font-semibold text-gray-900">Type</TableHead>
              <TableHead className="font-semibold text-gray-900">Duration (min)</TableHead>
              <TableHead className="font-semibold text-gray-900">Submitted By</TableHead>
              <TableHead className="font-semibold text-gray-900">Submitted At</TableHead>
              <TableHead className="text-center font-semibold text-gray-900">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity.id} className="hover:bg-gray-50">
                <TableCell className="border-b">{new Date(activity.date).toLocaleDateString()}</TableCell>
                <TableCell className="border-b">{activity.facility || 'HQ'}</TableCell>
                <TableCell className="font-medium border-b">{activity.title}</TableCell>
                <TableCell className="border-b">
                  <Badge className={getTypeColor(activity.type)}>
                    {activity.type}
                  </Badge>
                </TableCell>
                <TableCell className="border-b">{activity.duration || '-'}</TableCell>
                <TableCell className="border-b">{getUserDisplayName(activity.submitted_by)}</TableCell>
                <TableCell className="border-b">{new Date(activity.created_at).toLocaleString()}</TableCell>
                <TableCell className="border-b">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      onClick={() => handleEditActivity(activity)}
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      onClick={() => handleDeleteActivity(activity)}
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {activities.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No activities found</p>
        </div>
      )}
    </div>
  );

  const renderReportsSection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="bg-white rounded-xl p-6 border shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-[#be2251] mb-2">Activity Report</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">Comprehensive activity tracking and analysis</p>
          <Button className="w-full bg-[#fd3572] hover:bg-[#be2251] text-white">Generate Report</Button>
        </CardContent>
      </Card>

      <Card className="bg-white rounded-xl p-6 border shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-[#be2251] mb-2">User Report</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">User engagement and performance metrics</p>
          <Button className="w-full bg-[#fd3572] hover:bg-[#be2251] text-white">Generate Report</Button>
        </CardContent>
      </Card>

      <Card className="bg-white rounded-xl p-6 border shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-[#be2251] mb-2">System Report</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">System usage and performance statistics</p>
          <Button className="w-full bg-[#fd3572] hover:bg-[#be2251] text-white">Generate Report</Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettingsSection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-white rounded-xl p-6 border shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-[#be2251] mb-2 flex items-center gap-2">
            <Shield size={20} />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">Manage user permissions and access controls</p>
          <Button className="w-full bg-[#fd3572] hover:bg-[#be2251] text-white">Configure Security</Button>
        </CardContent>
      </Card>

      <Card className="bg-white rounded-xl p-6 border shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-[#be2251] mb-2 flex items-center gap-2">
            <Settings size={20} />
            System Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">Configure system-wide settings and preferences</p>
          <Button className="w-full bg-[#fd3572] hover:bg-[#be2251] text-white">Open Settings</Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <CountyHeader />
      <MainNavbar />

      {/* Admin Navigation */}
      <nav className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-xl border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-1">
              <div className="flex items-center gap-3 mr-6 text-white">
                <Shield className="text-[#fd3572]" size={20} />
                <span className="font-bold text-lg">Admin Panel</span>
              </div>
              
              {adminSections.map(section => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-[#fd3572] to-[#be2251] text-white shadow-lg transform scale-105"
                        : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                    }`}
                  >
                    <Icon size={16} />
                    <span>{section.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        {/* Dynamic Content Based on Active Section */}
        {activeSection === "dashboard" && renderDashboardOverview()}
        {activeSection === "activities" && renderActivitiesSection()}
        {activeSection === "reports" && renderReportsSection()}
        {activeSection === "settings" && renderSettingsSection()}

        {/* Edit Activity Dialog */}
        {editingActivity && (
          <EditActivityDialog
            activity={editingActivity}
            open={!!editingActivity}
            onClose={() => setEditingActivity(null)}
            onActivityUpdated={handleActivityUpdated}
          />
        )}

        {/* Delete Activity Dialog */}
        {deletingActivity && (
          <DeleteActivityDialog
            activity={deletingActivity}
            open={!!deletingActivity}
            onClose={() => setDeletingActivity(null)}
            onActivityDeleted={handleActivityDeleted}
          />
        )}
      </main>
    </div>
  );
};

export default Admin;
