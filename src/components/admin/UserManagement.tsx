import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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
    setIsLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: "Failed to load users", variant: "destructive" });
    } else {
      setUsers(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const cleanStatus = (status: string | null) => (status || "").trim().toLowerCase();

  const activeUsers = users.filter((u) => cleanStatus(u.status) === "active");
  const pendingUsers = users.filter((u) => cleanStatus(u.status) === "pending");
  const inactiveUsers = users.filter((u) => cleanStatus(u.status) === "inactive");

  const handleApprove = async (user: UserProfile) => {
    const { error } = await supabase
      .from("profiles")
      .update({ status: "active" })
      .eq("id", user.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Approved", description: `${user.email} is now active.` });
      fetchUsers();
    }
  };

  const handleMakeAdmin = async (user: UserProfile) => {
    const { error } = await supabase
      .from("profiles")
      .update({ role: "System Administrator" })
      .eq("id", user.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Role Updated", description: `${user.email} is now an admin.` });
      fetchUsers();
    }
  };

  const renderUserList = (list: UserProfile[], emptyMsg: string, icon: React.ReactNode) => {
    if (list.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          {icon}
          <p className="text-lg font-medium">{emptyMsg}</p>
        </div>
      );
    }

    return list.map((user) => (
      <div key={user.id} className="border rounded p-4 shadow-sm space-y-2">
        <div className="font-medium">{user.full_name || user.email}</div>
        <div className="text-sm text-gray-500">Status: {user.status}</div>
        <div className="text-sm text-gray-500">Role: {user.role}</div>
        <div className="flex gap-2">
          {cleanStatus(user.status) === "pending" && (
            <Button size="sm" onClick={() => handleApprove(user)}>
              Approve
            </Button>
          )}
          <Button size="sm" onClick={() => handleMakeAdmin(user)} variant="outline">
            Make Admin
          </Button>
          <Button size="sm" onClick={() => setEditingUser(user)} variant="secondary">
            Edit
          </Button>
          <Button size="sm" onClick={() => setDeletingUser(user)} variant="destructive">
            Delete
          </Button>
        </div>
      </div>
    ));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 flex justify-center">
            <div className="w-6 h-6 border-4 border-[#fd3572] border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>User Management</span>
            <Badge>{users.length} users</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="active">Active ({activeUsers.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingUsers.length})</TabsTrigger>
              <TabsTrigger value="inactive">Inactive ({inactiveUsers.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="active">{renderUserList(activeUsers, "No active users", <CheckCircle className="mx-auto text-gray-300 w-10 h-10" />)}</TabsContent>
            <TabsContent value="pending">{renderUserList(pendingUsers, "No pending users", <Clock className="mx-auto text-gray-300 w-10 h-10" />)}</TabsContent>
            <TabsContent value="inactive">{renderUserList(inactiveUsers, "No inactive users", <XCircle className="mx-auto text-gray-300 w-10 h-10" />)}</TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          open={!!editingUser}
          onClose={() => setEditingUser(null)}
          onUserUpdated={() => fetchUsers()}
        />
      )}

      {deletingUser && (
        <DeleteUserDialog
          user={deletingUser}
          open={!!deletingUser}
          onClose={() => setDeletingUser(null)}
          onUserDeleted={() => fetchUsers()}
        />
      )}
    </>
  );
};

export default UserManagement;

