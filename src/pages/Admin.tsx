import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import MainNavbar from "@/components/MainNavbar";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { useLiveTime } from "@/hooks/useLiveTime";
import {
  Monitor,
  Users,
  BarChart3,
  Settings,
  RefreshCw,
  LogOut,
} from "lucide-react";

const Admin = () => {
  const [userData, setUserData] = useState<{
    email: string;
    full_name: string;
    role: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { currentTime, greeting } = useLiveTime();

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error("Error fetching user:", error);
        setError(error.message || "Failed to fetch user data.");
        return;
      }

      if (data?.user) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", data.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          setError(
            profileError.message || "Failed to fetch user profile data."
          );
          return;
        }

        setUserData({
          email: data.user.email || "",
          full_name: profile?.full_name || "",
          role: profile?.role || "",
        });
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem("sb-access-token");
      localStorage.removeItem("sb-refresh-token");
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
      toast({
        title: "Error",
        description: "Failed to logout",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {greeting}, {userData?.full_name || userData?.email || "Admin"}!
          </h2>
          <span className="font-mono text-base sm:text-lg text-[#fd3572]">
            {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Admin;
