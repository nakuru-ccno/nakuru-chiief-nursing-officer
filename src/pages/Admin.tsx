import React, { useState, useEffect } from "react";
import MainNavbar from "@/components/MainNavbar";
import CountyHeader from "@/components/CountyHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AddUserDialog from "@/components/admin/AddUserDialog";
import EditUserDialog from "@/components/admin/EditUserDialog";
import DeleteUserDialog from "@/components/admin/DeleteUserDialog";
import { useToast } from "@/hooks/use-toast";

// Mock data for demo purposes
const mockStats = {
  totalUsers: 3,
  totalActivities: 12,
  thisMonth: 12,
  totalHours: 33,
  averageDuration: 165
};

const activitiesByType = [
  { name: 'Meetings', value: 4 },
  { name: 'Administrative', value: 3 },
  { name: 'Training', value: 3 },
  { name: 'Inventory Control', value: 2 }
];

const userActivity = [
  { name: 'Matoka', activities: 8 },
  { name: 'John', activities: 4 }
];

const initialUsers = [
  { id: 1, name: 'Matoka', email: 'matoka@nakuru.go.ke', role: 'Chief Nurse Officer', status: 'Active', lastLogin: '2024-06-14 10:30 AM' },
  { id: 2, name: 'John', email: 'john@nakuru.go.ke', role: 'Nurse Officer', status: 'Active', lastLogin: '2024-06-14 09:15 AM' },
  { id: 3, name: 'Admin', email: 'admin@nakuru.go.ke', role: 'System Administrator', status: 'Active', lastLogin: '2024-06-14 12:00 PM' }
];

const Admin = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [users, setUsers] = useState(initialUsers);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mockStats, setMockStats] = useState(getMockStats());
  const [activitiesByType, setActivitiesByType] = useState(getActivitiesByType());
  const [userActivity, setUserActivity] = useState(getUserActivity());
  const { toast } = useToast();

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Update stats when component mounts and when localStorage changes
  useEffect(() => {
    const updateStats = () => {
      setMockStats(getMockStats());
      setActivitiesByType(getActivitiesByType());
      setUserActivity(getUserActivity());
    };

    updateStats();

    // Listen for storage changes (when activities are updated)
    const handleStorageChange = (e) => {
      if (e.key === 'userActivities') {
        updateStats();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also update every 5 seconds to catch localStorage changes from the same tab
    const statsTimer = setInterval(updateStats, 5000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(statsTimer);
    };
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 22) return "Good Evening";
    return "Good Night";
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Load users from localStorage on component mount
  useEffect(() => {
    const savedUsers = localStorage.getItem('adminUsers');
    if (savedUsers) {
      try {
        const parsedUsers = JSON.parse(savedUsers);
        setUsers(parsedUsers);
        console.log('Loaded users from localStorage:', parsedUsers);
      } catch (error) {
        console.error('Error parsing saved users:', error);
        // If there's an error, fall back to initial users
        setUsers(initialUsers);
      }
    }
  }, []);

  // Save users to localStorage whenever users state changes
  useEffect(() => {
    localStorage.setItem('adminUsers', JSON.stringify(users));
    console.log('Saved users to localStorage:', users);
  }, [users]);

  const handleLogout = () => {
    console.log("Logout clicked");
    localStorage.removeItem("role");
    window.location.href = "/";
  };

  const handleNavClick = (tab: string) => {
    console.log(`${tab} navigation clicked`);
    setActiveTab(tab);
  };

  const handleActionClick = (action: string) => {
    console.log(`${action} button clicked`);
    switch(action) {
      case "Manage Users":
        setActiveTab("Users");
        break;
      case "Generate Reports":
        setActiveTab("Reports");
        break;
      case "Manage System":
        setActiveTab("Settings");
        break;
      default:
        break;
    }
  };

  const handleAddUser = (newUserData: { name: string; email: string; role: string; password: string }) => {
    // Create user locally (no Supabase Auth integration for now)
    const newUser = {
      id: users.length + 1,
      name: newUserData.name,
      email: newUserData.email,
      role: newUserData.role,
      status: 'Active',
      lastLogin: 'Never'
    };
    
    setUsers(prev => [...prev, newUser]);
    console.log('New user created locally:', newUser);
    
    toast({
      title: "Success",
      description: "User created successfully in the local system"
    });
  };

  const handleEditUser = (user) => {
    console.log('Edit user clicked:', user);
    setEditingUser(user);
  };

  const handleDeleteUser = (user) => {
    console.log('Delete user clicked:', user);
    setDeletingUser(user);
  };

  const handleUpdateUser = (updatedUserData) => {
    setUsers(prev => prev.map(user => 
      user.id === editingUser.id 
        ? { ...user, ...updatedUserData, lastLogin: user.lastLogin }
        : user
    ));
    
    console.log('User updated:', updatedUserData);
    setEditingUser(null);
    
    toast({
      title: "Success",
      description: "User updated successfully"
    });
  };

  const handleConfirmDelete = () => {
    setUsers(prev => prev.filter(user => user.id !== deletingUser.id));
    
    console.log('User deleted:', deletingUser);
    
    toast({
      title: "Success",
      description: "User deleted successfully"
    });
    
    setDeletingUser(null);
  };

  const handleExportPDF = () => {
    console.log("Export PDF clicked");
    toast({
      title: "Export Started",
      description: "PDF report is being generated and will be downloaded shortly"
    });
    // Simulate PDF generation
    setTimeout(() => {
      toast({
        title: "Success",
        description: "PDF report has been downloaded successfully"
      });
    }, 2000);
  };

  const handleExportExcel = () => {
    console.log("Export Excel clicked");
    toast({
      title: "Export Started",
      description: "Excel report is being generated and will be downloaded shortly"
    });
    // Simulate Excel generation
    setTimeout(() => {
      toast({
        title: "Success",
        description: "Excel report has been downloaded successfully"
      });
    }, 2000);
  };

  const handleGenerateReport = (reportType: string) => {
    console.log(`Generate ${reportType} Report clicked`);
    toast({
      title: "Report Generation Started",
      description: `${reportType} report is being generated`
    });
    // Simulate report generation
    setTimeout(() => {
      toast({
        title: "Success",
        description: `${reportType} report has been generated successfully`
      });
    }, 2000);
  };

  const renderDashboardContent = () => (
    <>
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-[#be2251]">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#fd3572]">{users.length}</div>
            <p className="text-sm text-gray-600">Registered nurse officers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-[#be2251]">Total Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#fd3572]">{mockStats.totalActivities}</div>
            <p className="text-sm text-gray-600">Activities recorded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-[#be2251]">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#fd3572]">{mockStats.thisMonth}</div>
            <p className="text-sm text-gray-600">Activities this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-[#be2251]">Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#fd3572]">{mockStats.totalHours}</div>
            <p className="text-sm text-gray-600">Hours logged system-wide</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <h3 className="font-bold text-[#be2251] mb-2">Manage Users</h3>
            <Button 
              onClick={() => handleActionClick("Manage Users")}
              className="bg-[#fd3572] hover:bg-[#be2251] text-white"
            >
              View Users ({users.length})
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <h3 className="font-bold text-[#be2251] mb-2">System Reports</h3>
            <Button 
              onClick={() => handleActionClick("Generate Reports")}
              className="bg-[#fd3572] hover:bg-[#be2251] text-white"
            >
              Generate Reports
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <h3 className="font-bold text-[#be2251] mb-2">System Settings</h3>
            <Button 
              onClick={() => handleActionClick("Manage System")}
              className="bg-[#fd3572] hover:bg-[#be2251] text-white"
            >
              Manage System
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats and Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#be2251]">Average Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#fd3572]">{mockStats.averageDuration}</div>
            <p className="text-sm text-gray-600">Minutes per activity</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#be2251]">Activities by Type</CardTitle>
            <p className="text-sm text-gray-600">Distribution of activities across categories</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={activitiesByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#fd3572" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#be2251]">User Activity Distribution</CardTitle>
            <p className="text-sm text-gray-600">Activities per user in the system</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={userActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="activities" fill="#be2251" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );

  const renderUsersContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#be2251]">User Management</h2>
        <AddUserDialog onAddUser={handleAddUser} />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold text-[#be2251]">Registered Users</CardTitle>
        </CardHeader>
        <CardContent>
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
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3">{user.name}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">{user.role}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {user.status}
                      </span>
                    </td>
                    <td className="p-3">{user.lastLogin}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditUser(user)}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handleDeleteUser(user)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          onUpdateUser={handleUpdateUser}
          onCancel={() => setEditingUser(null)}
        />
      )}

      {deletingUser && (
        <DeleteUserDialog
          user={deletingUser}
          onConfirmDelete={handleConfirmDelete}
          onCancel={() => setDeletingUser(null)}
        />
      )}
    </div>
  );

  const renderReportsContent = () => {
    const activities = getActivitiesFromStorage();
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#be2251]">System Reports</h2>
          <div className="flex gap-2">
            <Button 
              onClick={handleExportPDF}
              className="bg-[#fd3572] hover:bg-[#be2251] text-white"
            >
              Export PDF
            </Button>
            <Button 
              onClick={handleExportExcel}
              variant="outline"
            >
              Export Excel
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold text-[#be2251]">Activity Report</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Comprehensive activity tracking and analysis</p>
              <Button 
                onClick={() => handleGenerateReport("Activity")}
                className="w-full bg-[#fd3572] hover:bg-[#be2251] text-white"
              >
                Generate Report
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold text-[#be2251]">User Report</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">User engagement and performance metrics</p>
              <Button 
                onClick={() => handleGenerateReport("User")}
                className="w-full bg-[#fd3572] hover:bg-[#be2251] text-white"
              >
                Generate Report
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold text-[#be2251]">System Report</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">System usage and performance statistics</p>
              <Button 
                onClick={() => handleGenerateReport("System")}
                className="w-full bg-[#fd3572] hover:bg-[#be2251] text-white"
              >
                Generate Report
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Live Activities Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#be2251]">User Submitted Activities</CardTitle>
            <p className="text-sm text-gray-600">Real-time view of all activities submitted by users</p>
          </CardHeader>
          <CardContent>
            {activities.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-3 font-semibold text-[#be2251]">Date</th>
                      <th className="text-left p-3 font-semibold text-[#be2251]">Facility</th>
                      <th className="text-left p-3 font-semibold text-[#be2251]">Title</th>
                      <th className="text-left p-3 font-semibold text-[#be2251]">Type</th>
                      <th className="text-left p-3 font-semibold text-[#be2251]">Duration (min)</th>
                      <th className="text-left p-3 font-semibold text-[#be2251]">Submitted By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map((activity, index) => (
                      <tr key={activity.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-3">{activity.date}</td>
                        <td className="p-3">{activity.facility}</td>
                        <td className="p-3">{activity.title}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {activity.type}
                          </span>
                        </td>
                        <td className="p-3">{activity.duration}</td>
                        <td className="p-3">{activity.submittedBy || 'Unknown User'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No activities have been submitted yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#be2251]">Recent Activity Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activitiesByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#fd3572" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderSettingsContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#be2251]">System Settings</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#be2251]">General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">System Name</label>
              <input 
                type="text" 
                defaultValue="Nakuru County Nurse Activity Tracker"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
              <input 
                type="email" 
                defaultValue="admin@nakuru.go.ke"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <Button className="bg-[#fd3572] hover:bg-[#be2251] text-white">
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#be2251]">Security Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">Require strong passwords</span>
              </label>
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">Enable session timeout</span>
              </label>
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Enable two-factor authentication</span>
              </label>
            </div>
            <Button className="bg-[#fd3572] hover:bg-[#be2251] text-white">
              Update Security
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#be2251]">Backup & Maintenance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Last Backup:</span>
              <span className="text-sm text-gray-600">2024-06-14 08:00 AM</span>
            </div>
            <Button className="w-full bg-[#fd3572] hover:bg-[#be2251] text-white">
              Create Backup Now
            </Button>
            <Button variant="outline" className="w-full">
              Schedule Automatic Backups
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#be2251]">System Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Version:</span>
              <span className="text-sm text-gray-600">v1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Database:</span>
              <span className="text-sm text-green-600">Connected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Storage:</span>
              <span className="text-sm text-gray-600">85% Used</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Uptime:</span>
              <span className="text-sm text-gray-600">15 days, 4 hours</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <CountyHeader />
      
      {/* Custom Admin Navigation */}
      <nav className="w-full bg-[#111] flex items-center px-4 py-2 justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => handleNavClick("Dashboard")}
            className={`text-sm px-4 py-2 font-semibold rounded transition-all cursor-pointer ${
              activeTab === "Dashboard" 
                ? "bg-[#fd3572] text-white" 
                : "text-[#fd3572] hover:bg-[#251c21] hover:text-white"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => handleNavClick("Users")}
            className={`text-sm px-4 py-2 font-semibold rounded transition-all cursor-pointer ${
              activeTab === "Users" 
                ? "bg-[#fd3572] text-white" 
                : "text-[#fd3572] hover:bg-[#251c21] hover:text-white"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => handleNavClick("Reports")}
            className={`text-sm px-4 py-2 font-semibold rounded transition-all cursor-pointer ${
              activeTab === "Reports" 
                ? "bg-[#fd3572] text-white" 
                : "text-[#fd3572] hover:bg-[#251c21] hover:text-white"
            }`}
          >
            Reports
          </button>
          <button
            onClick={() => handleNavClick("Settings")}
            className={`text-sm px-4 py-2 font-semibold rounded transition-all cursor-pointer ${
              activeTab === "Settings" 
                ? "bg-[#fd3572] text-white" 
                : "text-[#fd3572] hover:bg-[#251c21] hover:text-white"
            }`}
          >
            Settings
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs px-4 py-2 rounded bg-[#be2251] text-white font-bold shadow hover:bg-[#fd3572] ml-2"
        >
          Logout
        </button>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#be2251] mb-2">
            {getGreeting()}, System Administrator!
          </h1>
          <div className="flex items-center gap-4 text-gray-600 mb-2">
            <span className="font-medium">County of Unlimited Opportunities</span>
            <span className="bg-[#fd3572] text-white px-3 py-1 rounded-full text-sm font-medium">HQ</span>
          </div>
          <div className="flex items-center gap-4 text-gray-500 text-sm">
            <span>{formatDate()}</span>
            <span className="font-mono text-lg text-[#fd3572]">{formatTime()}</span>
          </div>
        </div>

        {/* Dynamic Content Based on Active Tab */}
        {activeTab === "Dashboard" && renderDashboardContent()}
        {activeTab === "Users" && renderUsersContent()}
        {activeTab === "Reports" && renderReportsContent()}
        {activeTab === "Settings" && renderSettingsContent()}
      </div>
    </div>
  );
};

export default Admin;

const getActivitiesFromStorage = () => {
  const savedActivities = localStorage.getItem('userActivities');
  if (savedActivities) {
    try {
      return JSON.parse(savedActivities);
    } catch (error) {
      console.error('Error parsing saved activities:', error);
      return [];
    }
  }
  return [];
};

const getMockStats = () => {
  const activities = getActivitiesFromStorage();
  const totalActivities = activities.length;
  const totalHours = activities.reduce((sum, activity) => sum + (activity.duration || 0), 0);
  const averageDuration = totalActivities > 0 ? Math.round(totalHours / totalActivities) : 0;
  
  return {
    totalUsers: 3,
    totalActivities,
    thisMonth: totalActivities, // For demo, assuming all are this month
    totalHours: Math.round(totalHours / 60), // Convert minutes to hours
    averageDuration
  };
};

const getActivitiesByType = () => {
  const activities = getActivitiesFromStorage();
  const typeCount = activities.reduce((acc, activity) => {
    const type = activity.type || 'Other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  
  return Object.entries(typeCount).map(([name, value]) => ({ name, value }));
};

const getUserActivity = () => {
  const activities = getActivitiesFromStorage();
  const userCount = activities.reduce((acc, activity) => {
    const user = activity.submittedBy || 'Unknown User';
    acc[user] = (acc[user] || 0) + 1;
    return acc;
  }, {});
  
  return Object.entries(userCount).map(([name, activities]) => ({ name, activities }));
};
