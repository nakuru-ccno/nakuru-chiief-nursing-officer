
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, User, Shield, Clock } from "lucide-react";
import EditUserDialog from "./EditUserDialog";
import DeleteUserDialog from "./DeleteUserDialog";

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
      console.log('🔄 UserManagement - Fetching users');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching users:', error);
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ UserManagement - Users loaded:', data?.length || 0);
      setUsers(data || []);
    } catch (error) {
      console.error('❌ Error in fetchUsers:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Remove auto-refresh and only fetch on mount
  useEffect(() => {
    fetchUsers();
  }, []); // Empty dependency array - only run once

  const getRoleColor = (role: string) => {
    const colors = {
      'System Administrator': 'bg-red-100 text-red-800',
      'admin': 'bg-red-100 text-red-800',
      'Chief Nurse Officer': 'bg-purple-100 text-purple-800',
      'Nurse Officer': 'bg-blue-100 text-blue-800',
      'Senior Nurse': 'bg-green-100 text-green-800',
      'Staff Nurse': 'bg-yellow-100 text-yellow-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'inactive': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleEditUser = (user: UserProfile) => {
    console.log('📝 Opening edit dialog for user:', user.email);
    setEditingUser(user);
  };

  const handleDeleteUser = (user: UserProfile) => {
    console.log('🗑️ Opening delete dialog for user:', user.email);
    setDeletingUser(user);
  };

  const handleUserUpdated = (updatedUser: UserProfile) => {
    console.log('✅ User updated:', updatedUser.email);
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
    console.log('✅ User deleted:', deletedId);
    setUsers(prev => prev.filter(user => user.id !== deletedId));
    setDeletingUser(null);
    toast({
      title: "Success",
      description: "User deleted successfully",
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
              {users.length} users
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.length > 0 ? (
              users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 bg-[#fd3572] text-white rounded-full flex items-center justify-center font-bold">
                      {user.full_name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {user.full_name || user.email}
                      </h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`text-xs ${getRoleColor(user.role)}`}>
                          {user.role}
                        </Badge>
                        <Badge className={`text-xs ${getStatusColor(user.status)}`}>
                          {user.status}
                        </Badge>
                        {user.email_verified && (
                          <Badge className="text-xs bg-blue-100 text-blue-800">
                            <Shield className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right text-sm text-gray-500 mr-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Created: {formatDate(user.created_at)}</span>
                      </div>
                      {user.last_sign_in_at && (
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          <span>Last login: {formatDate(user.last_sign_in_at)}</span>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => handleEditUser(user)}
                      size="sm"
                      variant="outline"
                      className="border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      onClick={() => handleDeleteUser(user)}
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No users found</p>
                <p className="text-sm">Users will appear here once they register</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      {editingUser && (
        <EditUserDialog
          user={editingUser}
          open={!!editingUser}
          onClose={() => setEditingUser(null)}
          onUserUpdated={handleUserUpdated}
        />
      )}

      {/* Delete User Dialog */}
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
