
import React from "react";
import MainNavbar from "@/components/MainNavbar";
import CountyHeader from "@/components/CountyHeader";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Eye, FileBarChart } from "lucide-react";

export default function Dashboard() {
  // Get current time for greeting
  const currentHour = new Date().getHours();
  const getGreeting = () => {
    if (currentHour < 12) return "Good Morning";
    if (currentHour < 17) return "Good Afternoon";
    return "Good Evening";
  };

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
          <div className="flex items-center gap-4 text-gray-600">
            <span className="font-medium">County of Unlimited Opportunities</span>
            <span className="bg-[#fd3572] text-white px-3 py-1 rounded-full text-sm font-medium">HQ</span>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-[#fd3572]">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-[#be2251]">Total Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-[#fd3572] mb-1">12</div>
              <p className="text-gray-600">All time activities</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#be2251]">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-[#be2251]">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-[#fd3572] mb-1">12</div>
              <p className="text-gray-600">Activities this month</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-[#be2251]">Total Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-[#fd3572] mb-1">33</div>
              <p className="text-gray-600">Hours logged</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-[#be2251]">Average</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-[#fd3572] mb-1">165</div>
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
                <Link to="/activities">View All (12)</Link>
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
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Meetings</span>
                <span className="text-[#fd3572] font-bold">7 activities</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Administrative</span>
                <span className="text-[#fd3572] font-bold">1 activities</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Training</span>
                <span className="text-[#fd3572] font-bold">2 activities</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Inventory Control</span>
                <span className="text-[#fd3572] font-bold">1 activities</span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-[#be2251]">Recent Activities</CardTitle>
              <p className="text-gray-600">Your latest recorded activities</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-[#be2251]">Weekly Staff Meeting</h4>
                  <span className="text-sm text-gray-500">2 hours ago</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Discussed patient care protocols and staff scheduling</p>
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Meetings</span>
              </div>
              
              <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-[#be2251]">Inventory Audit</h4>
                  <span className="text-sm text-gray-500">1 day ago</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Monthly medical supplies inventory check</p>
                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Inventory Control</span>
              </div>
              
              <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-[#be2251]">Training Session</h4>
                  <span className="text-sm text-gray-500">2 days ago</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Emergency response procedures training</p>
                <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Training</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
