
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface SystemMetrics {
  cpu: number;
  memory: number;
  storage: number;
  network: number;
  uptime: string;
  status: 'healthy' | 'warning' | 'critical';
}

const SystemMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 45,
    memory: 62,
    storage: 78,
    network: 35,
    uptime: '99.9%',
    status: 'healthy'
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => {
        const newCpu = Math.max(10, Math.min(95, prev.cpu + Math.floor(Math.random() * 20) - 10));
        const newMemory = Math.max(20, Math.min(90, prev.memory + Math.floor(Math.random() * 15) - 7));
        const newStorage = Math.max(30, Math.min(85, prev.storage + Math.floor(Math.random() * 6) - 3));
        const newNetwork = Math.max(5, Math.min(80, prev.network + Math.floor(Math.random() * 25) - 12));
        
        let status: SystemMetrics['status'] = 'healthy';
        if (newCpu > 80 || newMemory > 85) {
          status = 'critical';
        } else if (newCpu > 60 || newMemory > 70) {
          status = 'warning';
        }

        return {
          cpu: newCpu,
          memory: newMemory,
          storage: newStorage,
          network: newNetwork,
          uptime: prev.uptime,
          status
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: SystemMetrics['status']) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
    }
  };

  const getProgressColor = (value: number) => {
    if (value > 80) return 'bg-red-500';
    if (value > 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold text-[#be2251] flex items-center justify-between">
          System Monitor
          <Badge className={getStatusColor(metrics.status)}>
            {metrics.status.toUpperCase()}
          </Badge>
        </CardTitle>
        <p className="text-sm text-gray-600">Real-time system performance</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>CPU Usage</span>
            <span>{metrics.cpu}%</span>
          </div>
          <Progress value={metrics.cpu} className="h-2" />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Memory Usage</span>
            <span>{metrics.memory}%</span>
          </div>
          <Progress value={metrics.memory} className="h-2" />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Storage Usage</span>
            <span>{metrics.storage}%</span>
          </div>
          <Progress value={metrics.storage} className="h-2" />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Network Activity</span>
            <span>{metrics.network}%</span>
          </div>
          <Progress value={metrics.network} className="h-2" />
        </div>

        <div className="pt-2 border-t">
          <div className="flex justify-between text-sm">
            <span className="font-medium">System Uptime</span>
            <span className="text-green-600 font-bold">{metrics.uptime}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemMonitor;
