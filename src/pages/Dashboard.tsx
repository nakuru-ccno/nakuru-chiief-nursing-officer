
import React, { useState, useEffect } from "react";
import MainNavbar from "@/components/MainNavbar";
import CountyHeader from "@/components/CountyHeader";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Eye, FileBarChart } from "lucide-react";

type Activity = {
  id: string;
  date: string;
  facility: string;
  title: string;
  type: string;
  duration: number;
  description: string;
  submittedBy: string;
  submittedAt: string;
};

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activities, setActivities] = useState<Activity[]>([]);

  // Load activities from localStorage
  useEffect(() => {
    const savedActivities = localStorage.getItem('userActivities');
    if (savedActivities) {
      try {
        const parsedActivities = JSON.parse(savedActivities);
        setActivities(parsedActivities);
      } catch (error) {
        console.error('Error parsing saved activities:', error);
      }
    }
  }, []);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
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

  // Calculate statistics from actual data
  const totalActivities = activities.length;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthActivities = activities.filter(activity => {
    const activityDate = new Date(activity.date);
    return activityDate.getMonth() === currentMonth && activityDate.getFullYear() === currentYear;
  }).length;
  
  const totalHours = Math.round(activities.reduce((sum, activity) => sum + activity.duration, 0) / 60);
  const averageDuration = totalActivities > 0 ? Math.round(activities.reduce((sum, activity) => sum + activity.duration, 0) / totalActivities) : 0;

  // Get activity type counts
  const activityTypeCounts = activities.reduce((acc, activity) => {
    acc[activity.type] = (acc[activity.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get recent activities (last 3)
  const recentActivities = activities.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <CountyHeader />
      <MainNavbar />
      
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-12">
        {/* Greeting Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#be2251] mb-2">
            {getGreeting()}, John Gitahi!
          </h2>
          <div className="flex items-center gap-4 text-gray-600 mb-2">
            <span className="font-medium">County of Unlimited Opportunities</span>
            <span className="bg-[#fd3572] text-white px-3 py-1 rounded-full text-sm font-medium">HQ</span>
          </div>
          <div className="flex items-center gap-4 text-gray-500 text-sm">
            <span>{formatDate()}</span>
            <span className="font-mono text-lg text-[#fd3572]">{formatTime()}</span>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-[#fd3572]">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-[#be2251]">Total Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-[#fd3572] mb-1">{totalActivities}</div>
              <p className="text-gray-600">All time activities</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#be2251]">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-[#be2251]">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-[#fd3572] mb-1">{thisMonthActivities}</div>
              <p className="text-gray-600">Activities this month</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-[#be2251]">Total Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-[#fd3572] mb-1">{totalHours}</div>
              <p className="text-gray-600">Hours logged</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-[#be2251]">Average</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-[#fd3572] mb-1">{averageDuration}</div>
              <p className="text-gray-600">Minutes per activity</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-[#fd3572] text-white p-3 rounded-full">
                  <Plus size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#be2251]">Add New Activity</h3>
                  <p className="text-gray-600">Record your daily administrative tasks</p>
                </div>
              </div>
              <Button 
                asChild 
                className="w-full bg-[#fd3572] hover:bg-[#be2251] text-white"
              >
                <Link to="/activities">Create Activity</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-[#be2251] text-white p-3 rounded-full">
                  <Eye size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#be2251]">View Activities</h3>
                  <p className="text-gray-600">Browse and manage all your activities</p>
                </div>
              </div>
              <Button 
                asChild 
                variant="outline" 
                className="w-full border-[#fd3572] text-[#fd3572] hover:bg-[#fd3572] hover:text-white"
              >
                <Link to="/activities">View All ({totalActivities})</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-green-600 text-white p-3 rounded-full">
                  <FileBarChart size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#be2251]">Generate Reports</h3>
                  <p className="text-gray-600">Export and analyze your activity data</p>
                </div>
              </div>
              <Button 
                asChild 
                variant="outline" 
                className="w-full border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
              >
                <Link to="/reports">View Reports</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Activity Types Overview and Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Activity Types Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-[#be2251]">Activity Types Overview</CardTitle>
              <p className="text-gray-600">Your activity distribution by category</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(activityTypeCounts).length > 0 ? (
                Object.entries(activityTypeCounts).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{type}</span>
                    <span className="text-[#fd3572] font-bold">{count} activities</span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-center py-4">No activities yet</div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-[#be2251]">Recent Activities</CardTitle>
              <p className="text-gray-600">Your latest recorded activities</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => {
                  const timeAgo = new Date(activity.submittedAt) 
                    ? new Date().getTime() - new Date(activity.submittedAt).getTime()
                    : 0;
                  const hoursAgo = Math.floor(timeAgo / (1000 * 60 * 60));
                  const daysAgo = Math.floor(hoursAgo / 24);
                  
                  const timeString = daysAgo > 0 
                    ? `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`
                    : hoursAgo > 0 
                    ? `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`
                    : 'Just now';

                  const getTypeColor = (type: string) => {
                    switch (type) {
                      case 'Meetings': return 'bg-blue-100 text-blue-800';
                      case 'Training': return 'bg-purple-100 text-purple-800';
                      case 'Administrative': return 'bg-green-100 text-green-800';
                      default: return 'bg-gray-100 text-gray-800';
                    }
                  };

                  return (
                    <div key={activity.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-[#be2251]">{activity.title}</h4>
                        <span className="text-sm text-gray-500">{timeString}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                      <span className={`inline-block text-xs px-2 py-1 rounded ${getTypeColor(activity.type)}`}>
                        {activity.type}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-gray-500 text-center py-4">No recent activities</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
