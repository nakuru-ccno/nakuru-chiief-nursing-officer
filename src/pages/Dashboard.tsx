import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CountyHeader from "@/components/CountyHeader";
import MainNavbar from "@/components/MainNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  FileText, 
  Activity, 
  Clock, 
  TrendingUp, 
  Users,
  Home,
  BarChart3,
  Edit
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ActivityData {
  id: string;
  title: string;
  type: string;
  date: string;
  duration: number;
  facility: string;
  description: string;
  submitted_by: string;
  created_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Home");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentUser, setCurrentUser] = useState<string>("");
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [stats, setStats] = useState({
    totalActivities: 0,
    thisMonth: 0,
    totalHours: 0,
    averageDuration: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  // Check if user is admin
  const storedRole = localStorage.getItem("role") || "";
  const isAdmin = storedRole === 'admin' || 
                  storedRole === 'System Administrator' || 
                  storedRole.toLowerCase().includes('admin');

  // If user is admin, redirect them to admin page
  useEffect(() => {
    if (isAdmin) {
      navigate("/admin");
      return;
    }
  }, [isAdmin, navigate]);

  // Get current user and their role
  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email) {
        const userName = user.email.split('@')[0] || user.email;
        setCurrentUser(userName);
        setCurrentUserEmail(user.email);
        console.log('Current user set:', user.email);

        // Fetch user's role from profiles table
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('email', user.email)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          setUserRole('User'); // Default role
        } else if (profile) {
          setUserRole(profile.role || 'User');
          // Use full name if available, otherwise use email prefix
          setCurrentUser(profile.full_name || userName);
          console.log('User role set:', profile.role);
        }
      } else {
        // Fallback for demo users
        const demoUserEmail = localStorage.getItem("userEmail") || "demo@nakuru.go.ke";
        const demoUserName = demoUserEmail.split('@')[0];
        setCurrentUser(demoUserName);
        setCurrentUserEmail(demoUserEmail);
        setUserRole('User'); // Default role for demo users
        console.log('Demo user set:', demoUserEmail);
      }
    } catch (error) {
      console.error('Error getting current user:', error);
      setUserRole('User');
    }
  };

  // Fetch activities filtered by current user only
  const fetchActivities = async () => {
    if (!currentUserEmail) {
      console.log('No current user email, skipping fetch');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔄 Fetching user activities from Supabase for:', currentUserEmail);
      
      // Filter by current user's email only
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('submitted_by', currentUserEmail)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user activities:', error);
        setIsConnected(false);
        return;
      }

      console.log('✅ Dashboard - User activities loaded:', data?.length || 0, 'for user:', currentUserEmail);
      
      const formattedActivities: ActivityData[] = (data || []).map(activity => ({
        id: activity.id,
        title: activity.title,
        type: activity.type,
        date: activity.date,
        duration: activity.duration || 0,
        facility: activity.facility || 'HQ',
        description: activity.description || '',
        submitted_by: activity.submitted_by || 'User',
        created_at: activity.created_at
      }));

      setActivities(formattedActivities);
      setIsConnected(true);
      
      // Calculate stats from user's activities only
      const totalActivities = formattedActivities.length;
      
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const thisMonthActivities = formattedActivities.filter(activity => {
        const activityDate = new Date(activity.date);
        return activityDate >= thisMonth;
      });

      const totalMinutes = formattedActivities.reduce((sum, activity) => sum + activity.duration, 0);
      const totalHours = Math.floor(totalMinutes / 60);
      const averageDuration = totalActivities > 0 ? Math.round(totalMinutes / totalActivities) : 0;

      setStats({
        totalActivities,
        thisMonth: thisMonthActivities.length,
        totalHours,
        averageDuration
      });

    } catch (error) {
      console.error('Error fetching user activities:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Set up real-time subscription for user's activities only
  useEffect(() => {
    if (!currentUserEmail) return;

    let channel: any;
    let retryTimeout: NodeJS.Timeout;

    const setupRealtimeSync = () => {
      console.log('🚀 Setting up real-time sync for user activities:', currentUserEmail);
      
      // Initial fetch
      fetchActivities();

      // Set up real-time subscription filtered by current user
      channel = supabase
        .channel('user-dashboard-activities', {
          config: {
            broadcast: { self: true },
            presence: { key: 'user-dashboard' }
          }
        })
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'activities',
            filter: `submitted_by=eq.${currentUserEmail}`
          },
          (payload) => {
            console.log('📱 Real-time update received for user activities:', payload.eventType);
            fetchActivities();
          }
        )
        .subscribe((status) => {
          console.log('📡 User dashboard sync status:', status);
          
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
            console.log('✅ User dashboard synchronized for:', currentUserEmail);
          } else if (status === 'CHANNEL_ERROR') {
            setIsConnected(false);
            console.error('❌ Dashboard sync error - retrying...');
            
            retryTimeout = setTimeout(() => {
              setupRealtimeSync();
            }, 3000);
          }
        });
    };

    setupRealtimeSync();

    // Auto-refresh for user activities
    const autoRefreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing dashboard for user:', currentUserEmail);
      fetchActivities();
    }, 30000);

    // Visibility change handler
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('📱 Tab visible - syncing user activities');
        fetchActivities();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (channel) {
        console.log('🧹 Cleaning up dashboard sync subscriptions...');
        supabase.removeChannel(channel);
      }
      clearInterval(autoRefreshInterval);
      clearTimeout(retryTimeout);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      setIsConnected(false);
    };
  }, [currentUserEmail]);

  // Time updates
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Get current user on component mount
  useEffect(() => {
    getCurrentUser();
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 22) return "Good Evening";
    return "Good Night";
  };

  // Format the user display name with role
  const getUserDisplayName = () => {
    if (userRole && userRole !== 'User') {
      return `${currentUser}, ${userRole}`;
    }
    return currentUser;
  };

  const navItems = [
    { id: "Home", label: "Home", icon: Home },
    { id: "Activities", label: "Activities", icon: Activity },
    { id: "Reports", label: "Reports", icon: BarChart3 },
  ];

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    if (tab === "Activities") {
      navigate("/activities");
    } else if (tab === "Reports") {
      navigate("/reports");
    }
  };

  const handleEditActivity = (activityId: string) => {
    navigate(`/activities?edit=${activityId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CountyHeader />
        <MainNavbar />
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-[#fd3572] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your personal dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CountyHeader />
      <MainNavbar />
      
      {/* User Navigation - Only show for non-admin users */}
      {!isAdmin && (
        <nav className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-xl border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-1">
                <div className="flex items-center gap-3 mr-6 text-white">
                  <Users className="text-[#fd3572]" size={20} />
                  <span className="font-bold text-lg">My Personal Dashboard</span>
                  <div className={`w-2 h-2 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'} rounded-full`}></div>
                </div>
                
                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-[#fd3572] to-[#be2251] text-white shadow-lg transform scale-105"
                          : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                      }`}
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {isConnected ? 'Personal Data Only' : 'Loading...'}
                </span>
              </div>
            </div>
          </div>
        </nav>
      )}

      <div className="max-w-7xl mx-auto p-6">
        {/* Header with role in greeting */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#be2251] mb-2 flex items-center gap-3">
            {getGreeting()}, {getUserDisplayName()}!
            <div className={`w-3 h-3 ${isConnected ? 'bg-green-500' : 'bg-red-500'} rounded-full animate-pulse`}></div>
          </h1>
          <div className="flex items-center gap-4 text-gray-600 mb-2">
            <span className="font-medium">County of Unlimited Opportunities</span>
            <span className="bg-[#fd3572] text-white px-3 py-1 rounded-full text-sm font-medium">My Personal Dashboard</span>
            {userRole && userRole !== 'User' && (
              <span className="bg-[#be2251] text-white px-3 py-1 rounded-full text-sm font-medium">{userRole}</span>
            )}
          </div>
          <div className="flex items-center gap-4 text-gray-500 text-sm">
            <span>{currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span className="font-mono text-lg text-[#fd3572]">
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </span>
          </div>
        </div>

        {/* Stats Grid - Showing user's personal data only */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-[#be2251] flex items-center gap-2">
                My Activities
                <div className={`w-2 h-2 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'} rounded-full`}></div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#fd3572]">{stats.totalActivities}</div>
              <p className="text-sm text-gray-600">Total activities</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-[#be2251]">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#fd3572]">{stats.thisMonth}</div>
              <p className="text-sm text-gray-600">This month's activities</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-[#be2251]">Total Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#fd3572]">{stats.totalHours}</div>
              <p className="text-sm text-gray-600">Hours logged</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-[#be2251]">Average</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#fd3572]">{stats.averageDuration}</div>
              <p className="text-sm text-gray-600">Minutes per activity</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities Section */}
        {activities.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-[#be2251] flex items-center gap-2">
                My Recent Activities
                <div className={`w-2 h-2 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'} rounded-full`}></div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-l-4 border-l-[#fd3572] hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#be2251]">{activity.title}</h3>
                      <p className="text-sm text-gray-600">{activity.type} • {activity.facility}</p>
                      <p className="text-xs text-gray-500">{new Date(activity.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{activity.duration}min</span>
                      <Button
                        onClick={() => handleEditActivity(activity.id)}
                        size="sm"
                        variant="outline"
                        className="border-[#fd3572] text-[#fd3572] hover:bg-[#fd3572] hover:text-white"
                      >
                        <Edit size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-[#fd3572]" 
                onClick={() => navigate("/activities")}>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-[#be2251] flex items-center gap-3">
                <Plus className="text-[#fd3572]" size={24} />
                Add New Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Record your daily administrative tasks</p>
              <Button className="w-full bg-gradient-to-r from-[#fd3572] to-[#be2251] hover:from-[#be2251] hover:to-[#fd3572] text-white">
                Create Activity
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-[#fd3572]" 
                onClick={() => navigate("/activities")}>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-[#be2251] flex items-center gap-3">
                <Activity className="text-[#fd3572]" size={24} />
                View My Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Browse and manage your activities</p>
              <Button variant="outline" className="w-full border-[#fd3572] text-[#fd3572] hover:bg-[#fd3572] hover:text-white">
                View All ({stats.totalActivities})
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-[#fd3572]" 
                onClick={() => navigate("/reports")}>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-[#be2251] flex items-center gap-3">
                <FileText className="text-[#fd3572]" size={24} />
                Generate Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Export and analyze your activity data</p>
              <Button variant="outline" className="w-full border-[#fd3572] text-[#fd3572] hover:bg-[#fd3572] hover:text-white">
                Create Report
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Personal Activities Status Footer */}
        <div className="mt-8 p-4 bg-white rounded-lg border shadow-sm">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span className="flex items-center gap-2">
              <div className={`w-2 h-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'} rounded-full animate-pulse`}></div>
              {isConnected ? `Showing your personal activities only (${currentUserEmail})` : 'Loading your personal activities...'}
            </span>
            <span>Last updated: {currentTime.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
