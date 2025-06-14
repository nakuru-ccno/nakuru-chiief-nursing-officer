import React, { useState, useEffect } from "react";
import MainNavbar from "@/components/MainNavbar";
import CountyHeader from "@/components/CountyHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, TrendingUp, Calendar, Clock, Users, Settings, FileText, UserPlus, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AddUserDialog from "@/components/admin/AddUserDialog";
import { useToast } from "@/hooks/use-toast";

interface Activity {
  id: string;
  title: string;
  type: string;
  submitted_by: string;
  created_at: string;
  duration?: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
}

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
  created_at: string | null;
  last_sign_in_at: string | null;
}

const Dashboard = () => {
  const [currentUser, setCurrentUser] = useState<string>("User");
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  const [stats, setStats] = useState({
    totalActivities: 0,
    thisWeek: 0,
    totalHours: 0
  });
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const { toast } = useToast();

  // Get current user
  useEffect(() => {
    getCurrentUser();
  }, []);

  // Fetch user-specific data
  useEffect(() => {
    if (currentUserEmail) {
      fetchUserStats();
      fetchRecentActivities();
      if (currentUserRole === 'admin' || currentUserRole === 'System Administrator') {
        fetchAllUsers();
      }
    }
  }, [currentUserEmail, currentUserRole]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      setCurrentUserEmail(user.email);
      const displayName = user.user_metadata?.full_name || 
                         user.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 
                         "User";
      const userRole = user.user_metadata?.role || "User";
      setCurrentUser(displayName);
      setCurrentUserRole(userRole);
    } else {
      setCurrentUser("User");
      setCurrentUserEmail("");
      setCurrentUserRole("");
    }
  };

  const fetchAllUsers = async () => {
    try {
      console.log('Fetching all users...');
      
      // First try to fetch from profiles table
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*');

      if (!profileError && profiles) {
        console.log('Successfully fetched profiles:', profiles);
        const formattedUsers: User[] = profiles.map((profile: Profile) => ({
          id: profile.id,
          name: profile.full_name || profile.email?.split('@')[0] || 'Unknown',
          email: profile.email || 'No email',
          role: profile.role || 'User',
          status: 'Active',
          lastLogin: profile.last_sign_in_at ? new Date(profile.last_sign_in_at).toLocaleString() : 'Never'
        }));

        setAllUsers(formattedUsers);
        localStorage.setItem('systemUsers', JSON.stringify(formattedUsers));
        return;
      }

      console.log('Profile fetch failed, trying auth admin:', profileError);

      // Fallback: try to get auth users if we have admin privileges
      try {
        const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
          console.error('Auth admin error:', authError);
          // Use local storage as fallback
          const savedUsers = localStorage.getItem('systemUsers');
          if (savedUsers) {
            setAllUsers(JSON.parse(savedUsers));
          }
          return;
        }

        const formattedUsers: User[] = authData.users.map(user => ({
          id: user.id,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown',
          email: user.email || 'No email',
          role: user.user_metadata?.role || 'User',
          status: user.email_confirmed_at ? 'Active' : 'Pending',
          lastLogin: user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'
        }));

        setAllUsers(formattedUsers);
        localStorage.setItem('systemUsers', JSON.stringify(formattedUsers));
      } catch (adminError) {
        console.error('Admin access error:', adminError);
        // Use local storage as final fallback
        const savedUsers = localStorage.getItem('systemUsers');
        if (savedUsers) {
          setAllUsers(JSON.parse(savedUsers));
        }
      }

    } catch (error) {
      console.error('Error in fetchAllUsers:', error);
      // Use local storage as fallback
      const savedUsers = localStorage.getItem('systemUsers');
      if (savedUsers) {
        setAllUsers(JSON.parse(savedUsers));
      }
    }
  };

  const handleAddUser = async (newUserData: { name: string; email: string; role: string; password: string }) => {
    try {
      console.log('Adding new user:', newUserData);

      // Try to create user through Supabase Auth Admin API with auto-confirmation
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUserData.email,
        password: newUserData.password,
        email_confirm: true, // This bypasses email confirmation
        user_metadata: {
          full_name: newUserData.name,
          role: newUserData.role
        }
      });

      if (authError) {
        console.error('Supabase auth admin error:', authError);
        
        // Fallback: Add user locally and to profiles table
        const newUser: User = {
          id: `local_${Date.now()}`,
          name: newUserData.name,
          email: newUserData.email,
          role: newUserData.role,
          status: 'Active',
          lastLogin: 'Never'
        };

        // Try to insert into profiles table
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{
              id: newUser.id,
              email: newUser.email,
              full_name: newUser.name,
              role: newUser.role,
              created_at: new Date().toISOString()
            }]);

          if (profileError) {
            console.error('Profile insert error:', profileError);
          }
        } catch (insertError) {
          console.error('Insert error:', insertError);
        }

        // Update local state and storage
        const updatedUsers = [...allUsers, newUser];
        setAllUsers(updatedUsers);
        localStorage.setItem('systemUsers', JSON.stringify(updatedUsers));

        toast({
          title: "User Added",
          description: "User added to local system with fallback method."
        });
        return;
      }

      // If Supabase auth admin succeeded
      if (authData.user) {
        const newUser: User = {
          id: authData.user.id,
          name: newUserData.name,
          email: newUserData.email,
          role: newUserData.role,
          status: 'Active', // Admin-created users are automatically active
          lastLogin: 'Never'
        };

        // Try to insert into profiles table
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{
              id: authData.user.id,
              email: newUserData.email,
              full_name: newUserData.name,
              role: newUserData.role,
              created_at: new Date().toISOString()
            }]);

          if (profileError) {
            console.error('Profile insert error:', profileError);
          }
        } catch (insertError) {
          console.error('Insert error:', insertError);
        }

        // Update local state and storage
        const updatedUsers = [...allUsers, newUser];
        setAllUsers(updatedUsers);
        localStorage.setItem('systemUsers', JSON.stringify(updatedUsers));

        toast({
          title: "Success",
          description: "User created successfully and can login immediately!"
        });
      }

    } catch (error) {
      console.error('Error in handleAddUser:', error);
      toast({
        title: "Error",
        description: "Failed to create user. Please try again.",
        variant: "destructive"
      });
    }
  };

  const fetchUserStats = async () => {
    try {
      if (!currentUserEmail) return;

      const { data: activities, error } = await supabase
        .from('activities')
        .select('*')
        .eq('submitted_by', currentUserEmail);

      if (error) {
        console.error('Error fetching user activities:', error);
        return;
      }

      const totalActivities = activities?.length || 0;
      
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const thisWeekActivities = activities?.filter((activity: Activity) => {
        const activityDate = new Date(activity.created_at);
        return activityDate >= oneWeekAgo;
      }) || [];

      const totalMinutes = activities?.reduce((sum: number, activity: Activity) => 
        sum + (activity.duration || 0), 0) || 0;
      const totalHours = Math.floor(totalMinutes / 60);

      setStats({
        totalActivities,
        thisWeek: thisWeekActivities.length,
        totalHours
      });

    } catch (error) {
      console.error('Error fetching user stats:', error);
      setStats({
        totalActivities: 0,
        thisWeek: 0,
        totalHours: 0
      });
    }
  };

  const fetchRecentActivities = async () => {
    try {
      if (!currentUserEmail) return;

      const { data: activities, error } = await supabase
        .from('activities')
        .select('*')
        .eq('submitted_by', currentUserEmail)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching recent activities:', error);
        setRecentActivities([]);
        return;
      }

      setRecentActivities(activities || []);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      setRecentActivities([]);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 22) return "Good Evening";
    return "Good Night";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeColor = (type: string) => {
    const lowerType = type.toLowerCase();
    switch (lowerType) {
      case 'administrative': return 'bg-purple-100 text-purple-800';
      case 'meetings': return 'bg-blue-100 text-blue-800';
      case 'training': return 'bg-green-100 text-green-800';
      case 'documentation': return 'bg-yellow-100 text-yellow-800';
      case 'supervision': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const DashboardContent = () => (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-l-4 border-l-[#fd3572]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#be2251]">{stats.totalActivities}</div>
            <p className="text-xs text-muted-foreground">All time activities</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.thisWeek}</div>
            <p className="text-xs text-muted-foreground">Activities completed</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalHours}</div>
            <p className="text-xs text-muted-foreground">Hours logged</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold text-[#be2251] flex items-center gap-2">
            <Users className="h-5 w-5" />
            Your Recent Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{activity.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(activity.type)}`}>
                        {activity.type}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(activity.created_at)}
                      </span>
                      {activity.duration && (
                        <span className="text-sm text-gray-500">
                          • {activity.duration} min
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-lg font-medium">No activities yet</p>
              <p className="text-sm">Start by adding your first activity!</p>
              <Button 
                className="mt-4 bg-[#be2251] hover:bg-[#fd3572]"
                onClick={() => window.location.href = '/activities'}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Activity
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );

  const UsersContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#be2251]">User Management</h2>
        {(currentUserRole === 'admin' || currentUserRole === 'System Administrator') && (
          <AddUserDialog onAddUser={handleAddUser} />
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>System Users ({allUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {allUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-3 font-semibold text-[#be2251]">Name</th>
                    <th className="text-left p-3 font-semibold text-[#be2251]">Email</th>
                    <th className="text-left p-3 font-semibold text-[#be2251]">Role</th>
                    <th className="text-left p-3 font-semibold text-[#be2251]">Status</th>
                    <th className="text-left p-3 font-semibold text-[#be2251]">Last Login</th>
                    <th className="text-left p-3 font-semibold text-[#be2251]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3">{user.name}</td>
                      <td className="p-3">{user.email}</td>
                      <td className="p-3">{user.role}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          user.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="p-3">{user.lastLogin}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-lg font-medium">No users found</p>
              <p className="text-sm">Add users to manage the system</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const ReportsContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#be2251]">Reports & Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Activity Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button className="w-full bg-[#be2251] hover:bg-[#fd3572]">
                Generate Monthly Report
              </Button>
              <Button variant="outline" className="w-full">
                Export to Excel
              </Button>
              <Button variant="outline" className="w-full">
                Export to PDF
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total Users:</span>
                <span className="font-semibold">{allUsers.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Activities This Month:</span>
                <span className="font-semibold">{stats.thisWeek}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Hours Logged:</span>
                <span className="font-semibold">{stats.totalHours}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const SettingsContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#be2251]">Settings</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="notifications" className="text-sm font-medium">Email Notifications</label>
              <input type="checkbox" id="notifications" className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="reports" className="text-sm font-medium">Auto Reports</label>
              <input type="checkbox" id="reports" className="rounded" />
            </div>
            <Button className="w-full bg-[#be2251] hover:bg-[#fd3572]">
              Save Settings
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Current User</label>
              <p className="text-sm text-gray-600">{currentUserEmail}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <p className="text-sm text-gray-600">{currentUserRole}</p>
            </div>
            <Button variant="outline" className="w-full">
              Change Password
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <CountyHeader />
      <MainNavbar />
      
      {/* Modern Header Section */}
      <div className="bg-gradient-to-r from-[#be2251] via-[#fd3572] to-[#be2251] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {getGreeting()}, {currentUser}!
              </h1>
              <p className="text-white/90">Welcome to your nursing activity dashboard</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button 
                className="bg-white text-[#be2251] hover:bg-gray-100 font-semibold"
                onClick={() => window.location.href = '/activities'}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Activity
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Horizontal Navigation Tabs */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <DashboardContent />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UsersContent />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <ReportsContent />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SettingsContent />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
