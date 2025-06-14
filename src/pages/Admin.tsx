import React, { useState, useEffect } from "react";
import CountyHeader from "@/components/CountyHeader";
import MainNavbar from "@/components/MainNavbar";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EditActivityDialog from "@/components/admin/EditActivityDialog";
import DeleteActivityDialog from "@/components/admin/DeleteActivityDialog";
import EditUserDialog from "@/components/admin/EditUserDialog";
import DeleteUserDialog from "@/components/admin/DeleteUserDialog";
import AddUserDialog from "@/components/admin/AddUserDialog";
import DashboardSettings from "@/components/admin/DashboardSettings";
import UserPermissions from "@/components/admin/UserPermissions";
import DataManagement from "@/components/admin/DataManagement";
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
  Shield,
  UserPlus,
  Plus
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

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  last_sign_in_at: string;
}

interface ActivityType {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

const Admin = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [activeSection, setActiveSection] = useState("dashboard");
  const { toast } = useToast();
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [deletingActivity, setDeletingActivity] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [deletingUser, setDeletingUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalActivities: 0,
    totalUsers: 0,
    thisMonth: 0,
    avgDuration: 0,
    activeUsers: 0,
    systemLoad: 45
  });
  const [isConnected, setIsConnected] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [newActivityType, setNewActivityType] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchAllData();
    setupRealtimeSubscriptions();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([fetchActivities(), fetchUsers(), fetchActivityTypes()]);
  };

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
      calculateStats(uniqueActivities);
      setIsConnected(true);
      setLastSyncTime(new Date());

    } catch (error) {
      console.error('Error fetching activities:', error);
      setIsConnected(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchActivityTypes = async () => {
    // For now, we'll use predefined activity types
    // In a real implementation, this would come from a database table
    const predefinedTypes = [
      { id: '1', name: 'Administrative', description: 'Administrative tasks and paperwork', created_at: new Date().toISOString() },
      { id: '2', name: 'Meetings', description: 'Meetings and conferences', created_at: new Date().toISOString() },
      { id: '3', name: 'Training', description: 'Training and development activities', created_at: new Date().toISOString() },
      { id: '4', name: 'Documentation', description: 'Documentation and reporting', created_at: new Date().toISOString() },
      { id: '5', name: 'Supervision', description: 'Supervision and oversight', created_at: new Date().toISOString() },
      { id: '6', name: 'General', description: 'General activities', created_at: new Date().toISOString() }
    ];
    setActivityTypes(predefinedTypes);
  };

  const setupRealtimeSubscriptions = () => {
    console.log('🚀 Setting up live admin dashboard subscriptions...');
    
    const channel = supabase
      .channel('admin-live-dashboard', {
        config: {
          broadcast: { self: true },
          presence: { key: 'admin-live' }
        }
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities'
        },
        (payload) => {
          console.log('📊 Live update received:', payload.eventType);
          fetchActivities();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('👥 User update received:', payload.eventType);
          fetchUsers();
        }
      )
      .subscribe((status) => {
        console.log('📡 Live admin subscription status:', status);
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          console.log('✅ Live admin dashboard active');
        }
      });

    // Auto-refresh every 15 seconds for live dashboard
    const refreshInterval = setInterval(() => {
      console.log('🔄 Live dashboard auto-refresh...');
      fetchAllData();
      setLastSyncTime(new Date());
    }, 15000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(refreshInterval);
    };
  };

  const calculateStats = (activitiesData: Activity[]) => {
    const totalActivities = activitiesData.length;
    const uniqueUsers = new Set(activitiesData.map(a => a.submitted_by)).size;
    
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const thisMonthActivities = activitiesData.filter(activity => {
      const activityDate = new Date(activity.date);
      return activityDate >= thisMonth;
    }).length;

    const totalMinutes = activitiesData.reduce((sum, activity) => sum + (activity.duration || 0), 0);
    const avgDuration = totalActivities > 0 ? Math.round(totalMinutes / totalActivities) : 0;

    // Calculate active users (users who submitted activities in last 7 days)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const activeUsersCount = new Set(
      activitiesData
        .filter(activity => new Date(activity.created_at) >= lastWeek)
        .map(a => a.submitted_by)
    ).size;

    setStats({
      totalActivities,
      totalUsers: uniqueUsers,
      thisMonth: thisMonthActivities,
      avgDuration,
      activeUsers: activeUsersCount,
      systemLoad: Math.max(10, Math.min(90, 45 + Math.floor(Math.random() * 10) - 5))
    });
  };

  const adminSections = [
    { id: "dashboard", label: "Live Dashboard", icon: BarChart3 },
    { id: "activities", label: "Manage Activities", icon: Activity },
    { id: "users", label: "User Management", icon: Users },
    { id: "reports", label: "Generate Reports", icon: FileText },
    { id: "settings", label: "System Settings", icon: Settings },
  ];

  const addActivityType = () => {
    if (!newActivityType.name.trim()) {
      toast({
        title: "Error",
        description: "Activity type name is required",
        variant: "destructive",
      });
      return;
    }

    const newType = {
      id: (activityTypes.length + 1).toString(),
      name: newActivityType.name,
      description: newActivityType.description,
      created_at: new Date().toISOString()
    };

    setActivityTypes(prev => [...prev, newType]);
    setNewActivityType({ name: '', description: '' });
    
    toast({
      title: "Success",
      description: "Activity type added successfully",
    });
  };

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

  const handleEditUser = (user: any) => {
    setEditingUser(user);
  };

  const handleDeleteUser = (user: any) => {
    setDeletingUser(user);
  };

  const handleUserUpdated = async (userData: any) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: userData.name,
          email: userData.email,
          role: userData.role
        })
        .eq('id', editingUser.id);

      if (error) {
        console.error('Error updating user:', error);
        toast({
          title: "Error",
          description: "Failed to update user",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === editingUser.id 
          ? { ...user, full_name: userData.name, email: userData.email, role: userData.role }
          : user
      ));

      toast({
        title: "Success",
        description: "User updated successfully",
      });

      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleUserDeleted = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', deletingUser.id);

      if (error) {
        console.error('Error deleting user:', error);
        toast({
          title: "Error",
          description: "Failed to delete user",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      setUsers(prev => prev.filter(user => user.id !== deletingUser.id));

      toast({
        title: "Success",
        description: "User deleted successfully",
      });

      setDeletingUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleAddUser = () => {
    // Refresh the users list when a new user is added
    fetchUsers();
  };

  const renderLiveDashboard = () => (
    <div className="space-y-6">
      {/* Live Status Banner */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          <h3 className="text-lg font-bold">Live Admin Dashboard</h3>
          <Badge className="bg-white text-green-600">REAL-TIME</Badge>
        </div>
        <div className="text-sm">
          Last sync: {lastSyncTime.toLocaleTimeString()}
        </div>
      </div>

      {/* Live Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-[#be2251] flex items-center gap-2">
              <Activity size={20} />
              Total Activities
              <div className={`w-2 h-2 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'} rounded-full`}></div>
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
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#fd3572]">{users.length}</div>
            <p className="text-sm text-gray-600">Registered users</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-[#be2251] flex items-center gap-2">
              <TrendingUp size={20} />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#fd3572]">{stats.activeUsers}</div>
            <p className="text-sm text-gray-600">Last 7 days</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-[#be2251] flex items-center gap-2">
              <Clock size={20} />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#fd3572]">{stats.thisMonth}</div>
            <p className="text-sm text-gray-600">Activities this month</p>
          </CardContent>
        </Card>

        <Card className={`${stats.systemLoad > 70 ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-green-500'}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-[#be2251] flex items-center gap-2">
              <Shield size={20} />
              System Load
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${stats.systemLoad > 70 ? 'text-red-500' : 'text-[#fd3572]'}`}>
              {stats.systemLoad}%
            </div>
            <p className="text-sm text-gray-600">CPU Usage</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              onClick={() => setActiveSection("users")}>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-[#be2251] flex items-center gap-3">
              <Users className="text-[#fd3572]" size={24} />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Manage users and their permissions</p>
            <Button className="w-full bg-gradient-to-r from-[#fd3572] to-[#be2251] hover:from-[#be2251] hover:to-[#fd3572] text-white">
              Manage Users ({users.length})
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
            <p className="text-gray-600 mb-4">Configure activity types and system settings</p>
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

  const renderUsersSection = () => (
    <div className="bg-white rounded-xl p-6 border shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-[#be2251] mb-2">User Management</h3>
          <p className="text-sm text-gray-600">Manage all registered users and their permissions ({users.length} total)</p>
        </div>
        <div className="flex gap-2">
          <AddUserDialog onAddUser={handleAddUser} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-semibold text-gray-900">Email</TableHead>
              <TableHead className="font-semibold text-gray-900">Full Name</TableHead>
              <TableHead className="font-semibold text-gray-900">Role</TableHead>
              <TableHead className="font-semibold text-gray-900">Joined</TableHead>
              <TableHead className="font-semibold text-gray-900">Last Sign In</TableHead>
              <TableHead className="font-semibold text-gray-900">Status</TableHead>
              <TableHead className="text-center font-semibold text-gray-900">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="hover:bg-gray-50">
                <TableCell className="border-b font-medium">{user.email}</TableCell>
                <TableCell className="border-b">{user.full_name || 'Not provided'}</TableCell>
                <TableCell className="border-b">
                  <Badge className={user.role === 'admin' || user.role === 'System Administrator' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="border-b">{new Date(user.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="border-b">
                  {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}
                </TableCell>
                <TableCell className="border-b">
                  <Badge className={user.last_sign_in_at ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {user.last_sign_in_at ? 'Active' : 'Pending'}
                  </Badge>
                </TableCell>
                <TableCell className="border-b">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      onClick={() => handleEditUser(user)}
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      onClick={() => handleDeleteUser(user)}
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

      {users.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No users found</p>
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
    <div className="space-y-6">
      <Tabs defaultValue="activity-types" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activity-types">Activity Types</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard Settings</TabsTrigger>
          <TabsTrigger value="permissions">User Permissions</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
        </TabsList>

        <TabsContent value="activity-types" className="mt-6">
          <Card className="bg-white rounded-xl p-6 border shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-[#be2251] mb-2 flex items-center gap-2">
                <Activity size={20} />
                Activity Types Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Add and manage activity types for users</p>
              
              {/* Add New Activity Type Form */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type Name</label>
                  <input
                    type="text"
                    value={newActivityType.name}
                    onChange={(e) => setNewActivityType(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fd3572] focus:border-transparent"
                    placeholder="e.g., Site Inspection"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newActivityType.description}
                    onChange={(e) => setNewActivityType(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fd3572] focus:border-transparent"
                    placeholder="Brief description of this activity type"
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={addActivityType}
                  className="w-full bg-[#fd3572] hover:bg-[#be2251] text-white flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Activity Type
                </Button>
              </div>

              {/* Current Activity Types */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Current Activity Types ({activityTypes.length})</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {activityTypes.map((type) => (
                    <div key={type.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{type.name}</p>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 border-blue-300 text-blue-600 hover:bg-blue-50"
                        >
                          <Edit size={12} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard" className="mt-6">
          <DashboardSettings />
        </TabsContent>

        <TabsContent value="permissions" className="mt-6">
          <UserPermissions />
        </TabsContent>

        <TabsContent value="data" className="mt-6">
          <DataManagement />
        </TabsContent>
      </Tabs>
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
                <div className={`w-2 h-2 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'} rounded-full`}></div>
                {isConnected && <Badge className="bg-green-600 text-white text-xs">LIVE</Badge>}
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
        {activeSection === "dashboard" && renderLiveDashboard()}
        {activeSection === "activities" && renderActivitiesSection()}
        {activeSection === "users" && renderUsersSection()}
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

        {/* Edit User Dialog */}
        {editingUser && (
          <EditUserDialog
            user={editingUser}
            onUpdateUser={handleUserUpdated}
            onCancel={() => setEditingUser(null)}
          />
        )}

        {/* Delete User Dialog */}
        {deletingUser && (
          <DeleteUserDialog
            user={deletingUser}
            onConfirmDelete={handleUserDeleted}
            onCancel={() => setDeletingUser(null)}
          />
        )}
      </main>
    </div>
  );
};

export default Admin;
