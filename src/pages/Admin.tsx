
import React from "react";
import MainNavbar from "@/components/MainNavbar";
import CountyHeader from "@/components/CountyHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

const Admin = () => {
  const handleLogout = () => {
    localStorage.removeItem("role");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CountyHeader />
      
      {/* Custom Admin Navigation */}
      <nav className="w-full bg-[#111] flex items-center px-4 py-2 justify-between">
        <div className="flex gap-2">
          <span className="text-sm px-4 py-2 font-semibold rounded bg-[#fd3572] text-white">
            Dashboard
          </span>
          <span className="text-sm px-4 py-2 font-semibold text-[#fd3572] hover:bg-[#251c21] hover:text-white rounded transition-all cursor-pointer">
            Users
          </span>
          <span className="text-sm px-4 py-2 font-semibold text-[#fd3572] hover:bg-[#251c21] hover:text-white rounded transition-all cursor-pointer">
            Reports
          </span>
          <span className="text-sm px-4 py-2 font-semibold text-[#fd3572] hover:bg-[#251c21] hover:text-white rounded transition-all cursor-pointer">
            Settings
          </span>
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
          <h1 className="text-2xl font-bold text-[#be2251] mb-2">Good Afternoon, System Administrator!</h1>
          <h2 className="text-xl text-gray-700 mb-1">Nakuru County - System Administration Dashboard</h2>
          <p className="text-sm text-gray-500 italic">County of Unlimited Opportunities</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-[#be2251]">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#fd3572]">{mockStats.totalUsers}</div>
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
              <Button className="bg-[#fd3572] hover:bg-[#be2251] text-white">
                View Users ({mockStats.totalUsers})
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <h3 className="font-bold text-[#be2251] mb-2">System Reports</h3>
              <Button className="bg-[#fd3572] hover:bg-[#be2251] text-white">
                Generate Reports
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <h3 className="font-bold text-[#be2251] mb-2">System Settings</h3>
              <Button className="bg-[#fd3572] hover:bg-[#be2251] text-white">
                Manage System
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats and Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Average Duration Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold text-[#be2251]">Average Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#fd3572]">{mockStats.averageDuration}</div>
              <p className="text-sm text-gray-600">Minutes per activity</p>
            </CardContent>
          </Card>

          {/* Activities by Type Chart */}
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

          {/* User Activity Distribution */}
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
      </div>
    </div>
  );
};

export default Admin;
