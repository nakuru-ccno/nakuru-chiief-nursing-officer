import React, { useState, useEffect } from "react";
import MainNavbar from "@/components/MainNavbar";
import CountyHeader from "@/components/CountyHeader";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// @ts-ignore: Used for Excel export
import * as XLSX from "xlsx";

type Activity = {
  id: string;
  date: string;
  facility: string;
  title: string;
  type: string;
  duration: number;
  description: string;
  submitted_by: string;
  submitted_at: string;
  created_at: string;
};

export default function Reports() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string>("");
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");
  const { toast } = useToast();

  // Load activities from Supabase on component mount
  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUserEmail) {
      fetchActivities();
    }
  }, [currentUserEmail]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      setCurrentUserEmail(user.email);
      // Extract a clean name from the email or metadata
      const displayName = user.user_metadata?.full_name || 
                         user.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 
                         "User";
      setCurrentUser(displayName);
    } else {
      setCurrentUser("User");
      setCurrentUserEmail("");
    }
  };

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      if (!currentUserEmail) return;

      // Only fetch activities for the current user
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('submitted_by', currentUserEmail)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user activities:', error);
        toast({
          title: "Error",
          description: "Failed to load your activities from database",
          variant: "destructive",
        });
        setActivities([]);
        return;
      }

      console.log('Loaded user activities from Supabase for reports:', data);
      setActivities((data as Activity[]) || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        title: "Error",
        description: "Failed to load your activities",
        variant: "destructive",
      });
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (activities.length === 0) {
      toast({
        title: "No Data",
        description: "No activities to export",
        variant: "destructive",
      });
      return;
    }

    const ws = XLSX.utils.json_to_sheet(activities);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "My Activities");
    XLSX.writeFile(wb, `my-activities-${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "Success",
      description: "Your activities exported to Excel successfully",
    });
  };

  const handleExportPDF = () => {
    window.print();
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'meetings': 'bg-red-100 text-red-800',
      'administrative': 'bg-pink-100 text-pink-800',
      'training': 'bg-green-100 text-green-800',
      'documentation': 'bg-yellow-100 text-yellow-800',
      'supervision': 'bg-purple-100 text-purple-800',
      'general': 'bg-gray-100 text-gray-800'
    };
    return colors[type.toLowerCase() as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 22) return "Good Evening";
    return "Good Night";
  };

  // Calculate statistics from user's activities only
  const totalActivities = activities.length;
  const thisMonth = new Date();
  thisMonth.setDate(1);
  const thisMonthActivities = activities.filter(activity => {
    const activityDate = new Date(activity.created_at);
    return activityDate >= thisMonth;
  }).length;

  const totalHours = Math.floor(activities.reduce((sum, activity) => sum + (activity.duration || 0), 0) / 60);
  const averageMinutes = totalActivities > 0 ? Math.round(activities.reduce((sum, activity) => sum + (activity.duration || 0), 0) / totalActivities) : 0;

  // Activity type distribution for current user only
  const typeDistribution = activities.reduce((acc: any[], activity) => {
    const existing = acc.find(item => item.type === activity.type);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ type: activity.type, count: 1 });
    }
    return acc;
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CountyHeader />
        <MainNavbar />
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="text-center py-8 text-gray-500">
            <p>Loading your activities from database...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CountyHeader />
      <MainNavbar />
      
      {/* Hero Section with Gradient */}
      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">{getGreeting()}, {currentUser}!</h1>
          <p className="text-lg sm:text-xl mb-2">County of Unlimited Opportunities</p>
          <p className="text-sm sm:text-base opacity-90">📍 HQ</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 -mt-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4 sm:p-6">
              <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-1">{totalActivities}</div>
              <div className="text-xs sm:text-sm text-red-700 font-medium">Total Activities</div>
              <div className="text-xs text-red-600">All time activities</div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 sm:p-6">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">{thisMonthActivities}</div>
              <div className="text-xs sm:text-sm text-blue-700 font-medium">This Month</div>
              <div className="text-xs text-blue-600">Activities this month</div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 sm:p-6">
              <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">{totalHours}</div>
              <div className="text-xs sm:text-sm text-green-700 font-medium">Total Hours</div>
              <div className="text-xs text-green-600">Hours logged</div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4 sm:p-6">
              <div className="text-2xl sm:text-3xl font-bold text-yellow-600 mb-1">{averageMinutes}</div>
              <div className="text-xs sm:text-sm text-yellow-700 font-medium">Average</div>
              <div className="text-xs text-yellow-600">Minutes per activity</div>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-green-700 mb-2">Generate Reports</h3>
            <p className="text-sm text-gray-600 mb-4">Export and analyze your activity data</p>
            <div className="space-y-2">
              <button
                onClick={handleExportExcel}
                className="w-full bg-[#fd3572] text-white font-bold px-4 py-2 rounded shadow hover:bg-[#be2251] transition text-sm"
              >
                Export to Excel
              </button>
              <button
                onClick={handleExportPDF}
                className="w-full bg-black text-white font-bold px-4 py-2 rounded shadow hover:bg-gray-800 transition text-sm"
              >
                Export to PDF
              </button>
            </div>
          </Card>

          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-green-700">Your Activity Types Overview</CardTitle>
              <p className="text-sm text-gray-600">Your personal activity distribution by category</p>
            </CardHeader>
            <CardContent>
              {typeDistribution.length > 0 ? (
                <div className="space-y-3">
                  {typeDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-medium capitalize">{item.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{item.count} activities</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">No activity types to display yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-green-700">Your Recent Activities</CardTitle>
            <p className="text-sm text-gray-600">Your latest recorded activities</p>
          </CardHeader>
          <CardContent>
            {activities.length > 0 ? (
              <div className="space-y-4">
                {activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="border-l-4 border-l-blue-500 pl-4 py-3 bg-gray-50 rounded-r">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-gray-900 uppercase tracking-wide">
                          {activity.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{activity.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={`${getTypeColor(activity.type)} text-xs`}>
                            {activity.type}
                          </Badge>
                          <span className="text-xs text-gray-500">{activity.duration} min</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">You haven't added any activities yet. Start by adding your first activity!</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="text-sm italic text-gray-500 mt-6 text-center">
          All your submitted activities are synced across devices and visible here. Export for official reporting.
        </div>
      </div>
    </div>
  );
}
