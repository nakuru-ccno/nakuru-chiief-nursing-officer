import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash, Plus, UserCheck, UserX } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddUserDialog from "./AddUserDialog";
import EditUserDialog from "./EditUserDialog";
import DeleteUserDialog from "./DeleteUserDialog";

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: "active" | "pending" | "inactive";
  email_verified: boolean;
  approved_at: string | null;
  approved_by: string | null;
  created_at: string;
}

export default function UserManagement() {
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const predefinedRoles = [
    "System Administrator",
    "Nakuru County Chief Nursing Officer",
    "Nakuru County Deputy Chief Nursing Officer",
    "Chief Nurse Officer",
    "Nurse Officer",
    "Senior Nurse",
    "Staff Nurse"
  ];

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: "Failed to fetch users. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const users = data as User[];
      setActiveUsers(users.filter(user => user.status === 'active'));
      setPendingUsers(users.filter(user => user.status === 'pending'));
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (userData: { full_name: string; email: string; role: string; password: string }) => {
    try {
      setIsLoading(true);
      console.log("🔥 DEBUG: Starting user creation with data:", {
        email: userData.email,
        role: userData.role,
        full_name: userData.full_name,
        password_length: userData.password.length
      });

      // Call the database function to create user
      const { data, error } = await supabase.rpc('create_admin_user', {
        user_email: userData.email,
        user_password: userData.password,
        user_full_name: userData.full_name,
        user_role: userData.role
      });

      console.log("🔥 DEBUG: Supabase RPC response:", { data, error });

      if (error) {
        console.error("🔥 DEBUG: Supabase RPC error:", error);
        toast({
          title: "Error",
          description: `Database error: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      // Check if the response indicates success
      if (data && typeof data === 'object' && 'success' in data) {
        if (data.success) {
          console.log("🔥 DEBUG: User created successfully!");
          toast({
            title: "Success",
            description: "User created successfully! They can now log in immediately.",
          });
          setShowAddDialog(false);
          fetchUsers();
        } else {
          console.error("🔥 DEBUG: Function returned failure:", data.error);
          toast({
            title: "Error",
            description: data.error || "Failed to create user.",
            variant: "destructive",
          });
        }
      } else {
        console.error("🔥 DEBUG: Unexpected response format:", data);
        toast({
          title: "Error",
          description: "Unexpected response from server.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("🔥 DEBUG: Caught exception:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during user creation.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async (userId: string, userData: { full_name: string; email: string; role: string; password?: string }) => {
    try {
      setIsLoading(true);
      
      const updateData: any = {
        full_name: userData.full_name,
        email: userData.email,
        role: userData.role,
      };

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", userId);

      if (error) {
        console.error("Error updating user:", error);
        toast({
          title: "Error",
          description: "Failed to update user. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "User updated successfully!",
      });

      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (error) {
        console.error("Error deleting user:", error);
        toast({
          title: "Error",
          description: "Failed to delete user. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "User deleted successfully!",
      });

      setDeletingUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveUser = async (userId: string, userData: { role: string }) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from("profiles")
        .update({
          status: 'active',
          email_verified: true,
          role: userData.role,
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq("id", userId);

      if (error) {
        console.error("Error approving user:", error);
        toast({
          title: "Error",
          description: "Failed to approve user. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "User approved successfully!",
      });

      fetchUsers();
    } catch (error) {
      console.error("Error approving user:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectUser = async (userId: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (error) {
        console.error("Error rejecting user:", error);
        toast({
          title: "Error",
          description: "Failed to reject user. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "User registration rejected and removed.",
      });

      fetchUsers();
    } catch (error) {
      console.error("Error rejecting user:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const UserTable = ({ users, showApprovalActions = false }: { users: User[]; showApprovalActions?: boolean }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Verified</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.full_name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>
              <Badge
                variant={user.status === "active" ? "default" : user.status === "pending" ? "secondary" : "destructive"}
              >
                {user.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={user.email_verified ? "default" : "destructive"}>
                {user.email_verified ? "Yes" : "No"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  {showApprovalActions && user.status === 'pending' ? (
                    <>
                      <DropdownMenuItem onClick={() => handleApproveUser(user.id, { role: user.role || 'Staff Nurse' })}>
                        <UserCheck className="mr-2 h-4 w-4" /> Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRejectUser(user.id)}>
                        <UserX className="mr-2 h-4 w-4" /> Reject
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem onClick={() => setEditingUser(user)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDeletingUser(user)}>
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>View Details</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>Manage users, approvals, and system access.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active Users ({activeUsers.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending Approval ({pendingUsers.length})</TabsTrigger>
            <TabsTrigger value="add">Add New User</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Active Users</h3>
              <Button onClick={() => setShowAddDialog(true)} className="bg-[#fd3572] hover:bg-[#be2251]">
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </div>
            <UserTable users={activeUsers} />
          </TabsContent>
          
          <TabsContent value="pending" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Pending Approval</h3>
              <Badge variant="secondary">{pendingUsers.length} waiting</Badge>
            </div>
            {pendingUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No pending user registrations</p>
              </div>
            ) : (
              <UserTable users={pendingUsers} showApprovalActions={true} />
            )}
          </TabsContent>
          
          <TabsContent value="add" className="space-y-4">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-medium mb-4">Create New User</h3>
              <p className="text-sm text-gray-600 mb-4">
                Users created here will be able to log in immediately without email verification.
              </p>
              <Button 
                onClick={() => setShowAddDialog(true)} 
                className="w-full bg-[#fd3572] hover:bg-[#be2251]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New User Account
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Add User Dialog */}
      {showAddDialog && (
        <AddUserDialog
          onAddUser={handleAddUser}
          onCancel={() => setShowAddDialog(false)}
          predefinedRoles={predefinedRoles}
        />
      )}

      {/* Edit User Dialog */}
      {editingUser && (
        <EditUserDialog
          user={{
            id: parseInt(editingUser.id),
            name: editingUser.full_name || "",
            email: editingUser.email,
            role: editingUser.role || "",
            status: editingUser.status
          }}
          onUpdateUser={(userData) => handleUpdateUser(editingUser.id, userData)}
          onCancel={() => setEditingUser(null)}
          predefinedRoles={predefinedRoles}
        />
      )}

      {/* Delete User Dialog */}
      {deletingUser && (
        <DeleteUserDialog
          user={{
            id: parseInt(deletingUser.id),
            name: deletingUser.full_name || deletingUser.email,
            email: deletingUser.email,
            role: deletingUser.role || ""
          }}
          onConfirmDelete={() => handleDeleteUser(deletingUser.id)}
          onCancel={() => setDeletingUser(null)}
        />
      )}
    </Card>
  );
}
