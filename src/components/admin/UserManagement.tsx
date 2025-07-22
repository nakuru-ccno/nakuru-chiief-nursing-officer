import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, CheckCircle, Clock, XCircle } from "lucide-react";
import EditUserDialog from "./EditUserDialog";
import DeleteUserDialog from "./DeleteUserDialog";
import UserCard from "./UserCard";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
  created_at: string;
  last_sign_in_at: string;
  email_verified: boolean;
}

const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      console.log("🔄 UserManagement - Fetching users");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Error fetching users:", error);
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive",
        });
        return;
      }

      console.log("✅ UserManagement - Users loaded:", data?.length || 0);
      setUsers(data || []);
    } catch (error) {
      console.error("❌ Error in fetchUsers:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const checkMyProfile = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError || !authData?.user) {
        console.error("❌ Auth error or no user:", authError);
        return;
      }

      const email = authData.user.email;
      console.log("✅ Logged in as:", email);

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", email)
        .single();

      if (profileError) {
        console.error("❌ Error loading profile:", profileError);
        return;
      }

      console.log("👤 Profile from DB:", profile);
    };

    checkMyProfile();
  }, []);

  const handleEditUser = (user: UserProfile) => {
    setEditingUser(user);
  };

  const handleDeleteUser = (user: UserProfile) => {
    setDeletingUser(user);
  };

  const handleUserUpdated = (updatedUser: UserProfile) => {
    setUsers(prev =>
      prev.map(user =>
        user.id === updatedUser.id ? updatedUser : user
      )
    );
    setEditingUser(null);
    toast({
      title: "Success",
      description: "User updated successfully",
    });
  };

  const handleUserDeleted = (deletedId: string) => {
    setUsers(prev => prev.filter(user => user.id !== deletedId));
    setDeletingUser(null);
    toast({
      title: "Success",
      description: "User deleted successfully",
    });
  };

  const activeUsers = users.filter(user => user.status === "active");

  const pendingUsers = users.filter(user => {
    const cleanedStatus = user.status?.trim().toLowerCase();
    const isPending = cleanedStatus === "pending";

    if (isPending) {
      console.log("✅ Pending user found:", user.email);
    } else {
      console.log("❌ Not pending:", user.email, "| Status:", user.status);
    }

    return isPending;
  });

  const inactiveUsers = users.filter(user => user.status === "inactive");

  const renderEmptyState = (status: string, icon: React.ReactNode) => (
    <div className="text-center py-8 text-gray-500">
      {icon}
      <p className="text-lg font-medium">No {status} users</p>
      <p className="text-sm">
        {status.charAt(0).toUpperCase() + status.slice(1)} users will appear here
      </p>
    </div>
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-[#be2251] flex items-center gap-2">
            <User className="w-5 h-5" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-[#fd3572] border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600">Loading users...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-[#be2251] flex items-center gap-2">
            <User className="w-5 h-5" />
            User Management
            <Badge variant="outline" className="ml-auto">
              {users.length} total users
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Active ({activeUsers.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                Pending ({pendingUsers.length})
              </TabsTrigger>
              <TabsTrigger value="inactive" className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                Inactive ({inactiveUsers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-6">
              <div className="space-y-4">
                {activeUsers.length > 0 ? (
                  activeUsers.map(user => (
                    <UserCard
                      key={user.id}
                      user={user}
                      onEdit={handleEditUser}
                      onDelete={handleDeleteUser}
                    />
                  ))
                ) : (
                  renderEmptyState(
                    "active",
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  )
                )}
              </div>
            </TabsContent>

            <TabsContent value="pending" className="mt-6">
  <div className="bg-yellow-50 border border-yellow-300 p-4 rounded mb-4">
    <p>🟡 <strong>Debug:</strong> Pending users count: {pendingUsers.length}</p>
    <pre className="text-xs text-gray-700 overflow-auto max-h-60 mt-2">
      {JSON.stringify(pendingUsers, null, 2)}
    </pre>
  </div>

  <div className="space-y-4">
    {pendingUsers.length > 0 ? (
      pendingUsers.map(user => (
        <UserCard
          key={user.id}
          user={user}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
        />
      ))
    ) : (
      renderEmptyState(
        "pending",
        <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
      )
    )}
  </div>
</TabsContent>

            <TabsContent value="inactive" className="mt-6">
              <div className="space-y-4">
                {inactiveUsers.length > 0 ? (
                  inactiveUsers.map(user => (
                    <UserCard
                      key={user.id}
                      user={user}
                      onEdit={handleEditUser}
                      onDelete={handleDeleteUser}
                    />
                  ))
                ) : (
                  renderEmptyState(
                    "inactive",
                    <XCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  )
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          open={!!editingUser}
          onClose={() => setEditingUser(null)}
          onUserUpdated={handleUserUpdated}
        />
      )}

      {deletingUser && (
        <DeleteUserDialog
          user={deletingUser}
          open={!!deletingUser}
          onClose={() => setDeletingUser(null)}
          onUserDeleted={handleUserDeleted}
        />
      )}
    </>
  );
};

export default UserManagement;
