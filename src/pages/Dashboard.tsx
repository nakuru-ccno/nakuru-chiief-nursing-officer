import React, { useEffect, useState } from "react";
import CountyHeader from "@/components/CountyHeader";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

const Dashboard = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user?.email) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", session.user.email)
        .maybeSingle();

      if (!error && data) {
        setUserProfile(data);
      }

      setIsLoading(false);
    };

    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CountyHeader />
        <div className="max-w-7xl mx-auto p-8">
          <div className="text-center py-8 text-gray-500">
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CountyHeader />
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome, {userProfile?.name || "User"}!
        </h1>
        <p className="mt-2 text-gray-600">
          You are logged in as <strong>{userProfile?.role}</strong> and your
          status is <strong>{userProfile?.status}</strong>.
        </p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800">
              Daily Activities
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              View and log your daily nursing activities.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800">Reports</h2>
            <p className="text-sm text-gray-600 mt-2">
              Generate and review performance reports.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800">Calendar</h2>
            <p className="text-sm text-gray-600 mt-2">
              View upcoming events and schedule notifications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
