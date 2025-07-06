
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Calendar, Clock, MapPin, User, ArrowLeft } from "lucide-react";
import MainNavbar from "@/components/MainNavbar";

interface Activity {
  id: string;
  title: string;
  type: string;
  description?: string;
  date: string;
  duration?: number;
  facility?: string;
  submitted_by?: string;
  created_at: string;
}

interface SuccessPageProps {
  activity: Activity;
  onBack: () => void;
}

const SuccessPage: React.FC<SuccessPageProps> = ({ activity, onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <MainNavbar />
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <Card className="shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
              Activity Logged Successfully!
            </CardTitle>
            <p className="text-gray-600">
              Your activity has been recorded and saved to your profile.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-4">Activity Details</h3>
              
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700">Title:</span>
                  <p className="text-gray-900 mt-1">{activity.title}</p>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Type:</span>
                  <p className="text-gray-900 mt-1">{activity.type}</p>
                </div>
                
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(activity.date).toLocaleDateString("en-GB")}</span>
                </div>
                
                {activity.duration && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4" />
                    <span>{activity.duration} minutes</span>
                  </div>
                )}
                
                {activity.facility && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-4 h-4" />
                    <span>{activity.facility}</span>
                  </div>
                )}
                
                {activity.submitted_by && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <User className="w-4 h-4" />
                    <span>{activity.submitted_by}</span>
                  </div>
                )}
                
                {activity.description && (
                  <div>
                    <span className="font-medium text-gray-700">Description:</span>
                    <p className="text-gray-900 mt-1">{activity.description}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-center pt-4">
              <Button 
                onClick={onBack}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Activities
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuccessPage;
