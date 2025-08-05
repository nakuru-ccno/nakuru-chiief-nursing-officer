import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Mail, User, Shield, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
  created_at: string;
  last_sign_in_at?: string;
  email_verified: boolean;
  approved_at?: string;
}

export default function Profile() {
  const { user } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-700 mb-4">👤 My Profile</h1>
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center">
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getRoleColor = (role: string) => {
    const normalizedRole = role.toLowerCase();
    if (normalizedRole.includes("admin") || normalizedRole === "system administrator") {
      return "destructive";
    }
    if (normalizedRole.includes("manager") || normalizedRole.includes("supervisor")) {
      return "secondary";
    }
    return "default";
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-blue-700">👤 My Profile</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Main Profile Card */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-xl bg-blue-100 text-blue-700">
                  {profile?.full_name ? getInitials(profile.full_name) : "U"}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-xl text-blue-800">
              {profile?.full_name || "Unknown User"}
            </CardTitle>
            <div className="flex justify-center gap-2 mt-2">
              <Badge variant={getRoleColor(profile?.role || "")}>
                <Shield className="w-3 h-3 mr-1" />
                {profile?.role || "No Role"}
              </Badge>
              <Badge 
                className={getStatusColor(profile?.status || "")}
                variant="outline"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                {profile?.status || "Unknown"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-4 h-4" />
              <span>{profile?.email || user.email}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-4 h-4" />
              <span>User ID: {profile?.id}</span>
            </div>
          </CardContent>
        </Card>

        {/* Account Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-blue-800">Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-gray-600">
              <CalendarDays className="w-4 h-4" />
              <div>
                <p className="text-sm font-medium">Member Since</p>
                <p className="text-sm">
                  {profile?.created_at 
                    ? format(new Date(profile.created_at), "MMMM d, yyyy")
                    : "Unknown"
                  }
                </p>
              </div>
            </div>

            {profile?.last_sign_in_at && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <div>
                  <p className="text-sm font-medium">Last Sign In</p>
                  <p className="text-sm">
                    {format(new Date(profile.last_sign_in_at), "MMMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
            )}

            {profile?.approved_at && (
              <div className="flex items-center gap-2 text-gray-600">
                <CheckCircle className="w-4 h-4" />
                <div>
                  <p className="text-sm font-medium">Account Approved</p>
                  <p className="text-sm">
                    {format(new Date(profile.approved_at), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${profile?.email_verified ? "bg-green-500" : "bg-red-500"}`} />
              <span className="text-sm text-gray-600">
                Email {profile?.email_verified ? "Verified" : "Not Verified"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}