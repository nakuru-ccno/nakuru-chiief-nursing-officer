
import React, { useState } from "react";
import MainNavbar from "@/components/MainNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Database, Tags, Shield } from "lucide-react";
import DataManagement from "@/components/admin/DataManagement";
import ActivityTypesManagement from "@/components/admin/ActivityTypesManagement";

const AdminSettings = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <MainNavbar />
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 rounded-3xl p-8 mb-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl shadow-lg">
                <Settings className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
                  Admin Settings
                </h1>
                <p className="text-slate-300 text-lg">System configuration and data management</p>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-sm">Secure administrative controls</span>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Tabs */}
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold">
              <Settings className="h-7 w-7" />
              Administrative Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <Tabs defaultValue="data" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="data" className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Data Management
                </TabsTrigger>
                <TabsTrigger value="activity-types" className="flex items-center gap-2">
                  <Tags className="w-4 h-4" />
                  Activity Types
                </TabsTrigger>
              </TabsList>

              <TabsContent value="data">
                <DataManagement />
              </TabsContent>

              <TabsContent value="activity-types">
                <ActivityTypesManagement />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;
