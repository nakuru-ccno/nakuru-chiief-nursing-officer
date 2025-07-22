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
  is_admin: boolean;
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
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive",
        });
        console.error("❌ Error fetching users:", error);
        return;
      }

      if (data && data.length > 0) {
        console.log("✅ Loaded users from Supabase:", data.length);
        console.table(
          data.map((u) => ({
            email: u.email,
            role: u.role,
            status: u.status,
            is_admin: u.is_admin,
          }))
        );
      } else {
        console.warn("⚠️ Supabase returned no users");
      }

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

  const handleEditUser = (user: UserProfile) => setEditingUser(user);
  const handleDeleteUser = (user: UserProfile) => setDeletingUser(user);

  const handleUserUpdated = (updatedUser: UserProfile) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    setEditingUser(null);
    toast({ title: "Success", description: "User updated successfully" });
  };

  const handleUserDeleted = (deletedId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== deletedId));
    setDeletingUser(null);
    toast({ title: "Success", description: "User deleted successfully" });
  };

  const filterByStatus = (status: string) =>
    users.filter(
      (u) => (u.status ?? "").toLowerCase().trim() === status.toLowerCase()
    );

  const activeUsers = filterByStatus("active");
  const pendingUsers = filterByStatus("pending");
  const inactiveUsers = filterByStatus("inactive");

  const renderEmptyState = (label: string, icon: React.ReactNode) => (
    <div className="text-center py-8 text-gray-500">
      {icon}
      <p className="text-lg font-medium">No {label} users</p>
      <p className="text-sm">
        {label.charAt(0).toUpperCase() + label.slice(1)} users will appear here
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
              <TabsTrigger value="active">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Active ({activeUsers.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                <Clock className="w-4 h-4 text-yellow-600" />
                Pending ({pendingUsers.length})
              </TabsTrigger>
              <TabsTrigger value="inactive">
                <XCircle className="w-4 h-4 text-red-600" />
                Inactive ({inactiveUsers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-6">
              <div className="space-y-4">
                {activeUsers.length > 0 ? (
                  activeUsers.map((user) => (
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
              <div className="space-y-4">
                {pendingUsers.length > 0 ? (
                  pendingUsers.map((user) => (
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
                  inactiveUsers.map((user) => (
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
