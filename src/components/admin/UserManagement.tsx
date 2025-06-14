
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Edit, Trash2, UserPlus, Users } from "lucide-react";
import EditUserDialog from "./EditUserDialog";
import DeleteUserDialog from "./DeleteUserDialog";
import AddUserDialog from "./AddUserDialog";

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
  created_at: string | null;
  last_sign_in_at: string | null;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const { toast } = useToast();

  // Predefined roles for Nakuru County
  const predefinedRoles = [
    "System Administrator",
    "Nakuru County Chief Nursing Officer", 
    "Nakuru County Deputy Chief Nursing Officer",
    "Chief Nurse Officer",
    "Nurse Officer",
    "Senior Nurse",
    "Staff Nurse"
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      console.log('📊 Fetching users for management...');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching users:', error);
        toast({
          title: "Error",
          description: "Failed to load users from database",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Users loaded successfully:', data?.length || 0);
      setUsers(data || []);
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async (userId: string, userData: { full_name: string; email: string; role: string }) => {
    try {
      console.log('🔄 Updating user:', userId, userData);

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: userData.full_name,
          email: userData.email,
          role: userData.role
        })
        .eq('id', userId);

      if (error) {
        console.error('❌ Error updating user:', error);
        toast({
          title: "Error",
          description: "Failed to update user",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "User updated successfully",
      });

      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('❌ Unexpected error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      console.log('🗑️ Deleting user:', userId);

      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('❌ Error deleting user:', error);
        toast({
          title: "Error",
          description: "Failed to delete user",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "User deleted successfully",
      });

      setDeletingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('❌ Unexpected error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleAddUser = async (userData: { full_name: string; email: string; role: string; password: string }) => {
    try {
      console.log('➕ Adding new user:', userData);

      // Create user profile
      const { error } = await supabase
        .from('profiles')
        .insert({
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role
        });

      if (error) {
        console.error('❌ Error adding user:', error);
        toast({
          title: "Error",
          description: "Failed to add user",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "User added successfully. They can now register with this email.",
      });

      setShowAddUser(false);
      fetchUsers();
    } catch (error) {
      console.error('❌ Unexpected error adding user:', error);
      toast({
        title: "Error",
        description: "Failed to add user",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: string | null) => {
    if (!role) return "secondary";
    if (role.includes("Chief")) return "destructive";
    if (role.includes("Deputy")) return "default";
    if (role.includes("Administrator")) return "secondary";
    return "outline";
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-[#be2251] flex items-center gap-2">
            <Users size={20} />
            User Management - Nakuru County
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[250px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {predefinedRoles.map(role => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={() => setShowAddUser(true)}
              className="bg-[#fd3572] hover:bg-[#be2251] text-white"
            >
              <UserPlus size={16} className="mr-2" />
              Add User
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#be2251]">
            Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Sign In</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.full_name || "No name"}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeColor(user.role)}>
                        {user.role || "No role"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown"}
                    </TableCell>
                    <TableCell>
                      {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : "Never"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingUser(user)}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingUser(user)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users size={48} className="mx-auto mb-4 opacity-50" />
              <p>No users found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {editingUser && (
        <EditUserDialog
          user={{
            id: parseInt(editingUser.id),
            name: editingUser.full_name || "",
            email: editingUser.email,
            role: editingUser.role || "",
            status: "active"
          }}
          onUpdateUser={(userData) => handleUpdateUser(editingUser.id, userData)}
          onCancel={() => setEditingUser(null)}
          predefinedRoles={predefinedRoles}
        />
      )}

      {deletingUser && (
        <DeleteUserDialog
          user={{
            id: parseInt(deletingUser.id),
            name: deletingUser.full_name || deletingUser.email,
            email: deletingUser.email,
            role: deletingUser.role || "",
            status: "active"
          }}
          onDeleteUser={() => handleDeleteUser(deletingUser.id)}
          onCancel={() => setDeletingUser(null)}
        />
      )}

      {showAddUser && (
        <AddUserDialog
          onAddUser={handleAddUser}
          onCancel={() => setShowAddUser(false)}
          predefinedRoles={predefinedRoles}
        />
      )}
    </div>
  );
};

export default UserManagement;
