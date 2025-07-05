
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Calendar, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SuccessPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm max-w-lg w-full overflow-hidden">
        <CardContent className="p-0">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 p-8 text-center text-white">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2">
              Activity Submitted Successfully!
            </h2>
            <p className="text-green-100 text-lg">
              Your activity has been recorded and saved to your profile.
            </p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
              <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                What happens next?
              </h3>
              <ul className="space-y-2 text-green-700 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  Your activity will appear in your dashboard
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  Statistics will be updated automatically
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  You can edit or delete it from your dashboard
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-center gap-3 text-blue-600 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <Clock className="w-5 h-5" />
              <span className="font-medium">Redirecting to dashboard...</span>
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>

          {/* Action Button */}
          <div className="p-8 pt-0">
            <Button
              onClick={() => navigate('/dashboard')}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg transition-all duration-200 hover:scale-[1.02]"
            >
              <span>Go to Dashboard Now</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuccessPage;
