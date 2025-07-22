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
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

const roles = [
  "System Administrator",
  "Nakuru County Chief Nursing Officer",
  "Nakuru County Deputy Chief Nursing Officer",
  "Chief Nurse Officer",
  "Nurse Officer",
  "Senior Nurse",
  "Staff Nurse",
];

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
        toast({ title: "Error", description: "Failed to load users", variant: "destructive" });
        return;
      }

      setUsers(data || []);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load users", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const approveUser = async (userId: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ status: "active" })
      .eq("id", userId);

    if (error) {
      toast({ title: "Error", description: "Failed to approve user", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "User approved" });
      fetchUsers();
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) {
      toast({ title: "Error", description: "Failed to update role", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Role updated" });
      fetchUsers();
    }
  };

  const activeUsers = users.filter(user => user.status === "active");
  const pendingUsers = users.filter(user => user.status?.trim().toLowerCase() === "pending");
  const inactiveUsers = users.filter(user => user.status === "inactive");

  const renderUserRow = (user: UserProfile) => (
    <div key={user.id} className="border p-4 rounded-md shadow-sm bg-white space-y-2">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-semibold">{user.full_name}</p>
          <p className="text-sm text-gray-600">{user.email}</p>
        </div>
        <div className="text-sm capitalize">{user.status}</div>
      </div>

      <div className="flex items-center gap-4">
        <Select value={user.role} onValueChange={(val) => updateUserRole(user.id, val)}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select Role" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {user.status === "pending" && (
          <Button onClick={() => approveUser(user.id)} className="bg-green-600 text-white hover:bg-green-700">
            Approve
          </Button>
        )}

        <Button variant="outline" onClick={() => setEditingUser(user)}>Edit</Button>
        <Button variant="destructive" onClick={() => setDeletingUser(user)}>Delete</Button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-[#be2251] flex items-center gap-2">
            <User className="w-5 h-5" /> User Management
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
            <Badge variant="outline" className="ml-auto">{users.length} total users</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="active"><CheckCircle className="w-4 h-4 text-green-600" /> Active ({activeUsers.length})</TabsTrigger>
              <TabsTrigger value="pending"><Clock className="w-4 h-4 text-yellow-600" /> Pending ({pendingUsers.length})</TabsTrigger>
              <TabsTrigger value="inactive"><XCircle className="w-4 h-4 text-red-600" /> Inactive ({inactiveUsers.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">{activeUsers.map(renderUserRow)}</TabsContent>
            <TabsContent value="pending" className="space-y-4">{pendingUsers.map(renderUserRow)}</TabsContent>
            <TabsContent value="inactive" className="space-y-4">{inactiveUsers.map(renderUserRow)}</TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          open={!!editingUser}
          onClose={() => setEditingUser(null)}
          onUserUpdated={fetchUsers}
        />
      )}

      {deletingUser && (
        <DeleteUserDialog
          user={deletingUser}
          open={!!deletingUser}
          onClose={() => setDeletingUser(null)}
          onUserDeleted={fetchUsers}
        />
      )}
    </>
  );
};

export default UserManagement;
