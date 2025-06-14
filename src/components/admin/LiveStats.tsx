
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface LiveStatsProps {
  onStatsUpdate?: (stats: any) => void;
}

const LiveStats: React.FC<LiveStatsProps> = ({ onStatsUpdate }) => {
  const [stats, setStats] = useState({
    totalUsers: 3,
    totalActivities: 12,
    thisMonth: 12,
    totalHours: 33,
    averageDuration: 165,
    activeUsers: 2,
    systemLoad: 45
  });

  const [hourlyData, setHourlyData] = useState([
    { hour: '00:00', activities: 0, users: 0 },
    { hour: '04:00', activities: 1, users: 1 },
    { hour: '08:00', activities: 4, users: 2 },
    { hour: '12:00', activities: 6, users: 2 },
    { hour: '16:00', activities: 3, users: 1 },
    { hour: '20:00', activities: 2, users: 1 }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalActivities: prev.totalActivities + Math.floor(Math.random() * 2),
        totalHours: prev.totalHours + Math.floor(Math.random() * 3),
        activeUsers: Math.max(1, prev.activeUsers + Math.floor(Math.random() * 3) - 1),
        systemLoad: Math.max(10, Math.min(90, prev.systemLoad + Math.floor(Math.random() * 10) - 5))
      }));

      // Update hourly data occasionally
      if (Math.random() > 0.7) {
        setHourlyData(prev => {
          const newData = [...prev];
          const randomIndex = Math.floor(Math.random() * newData.length);
          newData[randomIndex] = {
            ...newData[randomIndex],
            activities: newData[randomIndex].activities + 1
          };
          return newData;
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    onStatsUpdate?.(stats);
  }, [stats, onStatsUpdate]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-[#be2251] flex items-center gap-2">
            Active Users
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-[#fd3572]">{stats.activeUsers}</div>
          <p className="text-sm text-gray-600">Currently online</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-[#be2251]">Total Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-[#fd3572]">{stats.totalActivities}</div>
          <p className="text-sm text-gray-600">All time</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-[#be2251]">Total Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-[#fd3572]">{stats.totalHours}</div>
          <p className="text-sm text-gray-600">System-wide</p>
        </CardContent>
      </Card>

      <Card className={`${stats.systemLoad > 70 ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-green-500'}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-[#be2251]">System Load</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${stats.systemLoad > 70 ? 'text-red-500' : 'text-[#fd3572]'}`}>
            {stats.systemLoad}%
          </div>
          <p className="text-sm text-gray-600">CPU Usage</p>
        </CardContent>
      </Card>

      <Card className="lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-[#be2251]">Activity Timeline (24h)</CardTitle>
          <p className="text-sm text-gray-600">Real-time activity distribution</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="activities" stroke="#fd3572" strokeWidth={2} />
              <Line type="monotone" dataKey="users" stroke="#be2251" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveStats;
