
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Activity {
  id: string;
  user: string;
  action: string;
  timestamp: Date;
  type: 'login' | 'activity' | 'logout' | 'admin';
  details?: string;
}

const LiveActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: '1',
      user: 'Matoka',
      action: 'Logged in',
      timestamp: new Date(Date.now() - 60000),
      type: 'login'
    },
    {
      id: '2',
      user: 'John',
      action: 'Created activity',
      timestamp: new Date(Date.now() - 120000),
      type: 'activity',
      details: 'Quarterly Meeting'
    },
    {
      id: '3',
      user: 'Admin',
      action: 'Generated report',
      timestamp: new Date(Date.now() - 300000),
      type: 'admin'
    }
  ]);

  // Simulate real-time activity updates
  useEffect(() => {
    const interval = setInterval(() => {
      const users = ['Matoka', 'John', 'Alice', 'Bob'];
      const actions = [
        { action: 'Logged in', type: 'login' as const },
        { action: 'Created activity', type: 'activity' as const, details: 'Training Session' },
        { action: 'Updated profile', type: 'activity' as const },
        { action: 'Generated report', type: 'admin' as const },
        { action: 'Logged out', type: 'logout' as const }
      ];

      if (Math.random() > 0.6) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        
        const newActivity: Activity = {
          id: Date.now().toString(),
          user: randomUser,
          action: randomAction.action,
          timestamp: new Date(),
          type: randomAction.type,
          details: randomAction.details
        };

        setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const getTypeColor = (type: Activity['type']) => {
    switch (type) {
      case 'login': return 'bg-green-100 text-green-800';
      case 'logout': return 'bg-red-100 text-red-800';
      case 'activity': return 'bg-blue-100 text-blue-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <Card className="h-96">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-[#be2251] flex items-center gap-2">
          Live Activity Feed
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </CardTitle>
        <p className="text-sm text-gray-600">Real-time user activities</p>
      </CardHeader>
      <CardContent className="space-y-3 max-h-80 overflow-y-auto">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#fd3572] text-white rounded-full flex items-center justify-center text-sm font-bold">
                {activity.user.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium">
                  <span className="font-bold">{activity.user}</span> {activity.action}
                </p>
                {activity.details && (
                  <p className="text-xs text-gray-600">{activity.details}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getTypeColor(activity.type)}>
                {activity.type}
              </Badge>
              <span className="text-xs text-gray-500">
                {formatTime(activity.timestamp)}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default LiveActivityFeed;
